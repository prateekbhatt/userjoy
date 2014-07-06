/**
 * This worker updates the health attribute of each user to good/average/poor
 */

/**
 * npm dependencies
 */

var _ = require('lodash');
var async = require('async');
var moment = require('moment');


/**
 * models
 */

var Segment = require('../api/models/Segment');
var User = require('../api/models/User');


/**
 * Helpers
 */

var logger = require('../helpers/logger');
var QueueError = require('../helpers/queue-error');


/**
 * Lib
 */

var Query = require('../api/lib/query');


/**
 * Queues
 */

var q = require('./queues');
var healthQueue = q.health;


/**
 * Finds the predefined health segment, runs the query and updates user health
 * status
 *
 * @param {string} aid app-id
 * @param {string} health good/average/poor
 * @param {function} cb callback
 */

function runHealthQuery(aid, health, cb) {

  if (!_.contains(['good', 'average', 'poor'], health)) {
    return cb(new QueueError('INVALID_HEALTH_TYPE'));
  }

  async.waterfall(

    [

      function findSegment(cb) {

        Segment
          .findOne({
            aid: aid,
            predefined: true,
            health: health
          })
          .lean()
          .exec(cb);
      },


      function runQuery(segment, cb) {

        if (!segment) return cb(new QueueError('SEGMENT_NOT_FOUND'));

        // segment object should be converted from BSON to JSON
        if (segment.toJSON) segment = segment.toJSON();

        var qObj = {
          list: segment.list,
          op: segment.op,
          filters: segment.filters
        };

        var query;

        try {
          query = new Query(segment.aid, qObj);
        } catch (err) {
          return cb(err);
        }

        query.run(function (err, users) {
          cb(err, users);
        });
      },


      function updateHealthStatus(users, cb) {

        var uids = _.pluck(users, '_id');

        var conditions = {
          _id: {
            $in: uids
          }
        };

        var update = {
          health: health
        };

        var options = {
          multi: true
        };


        User.update(conditions, update, options, function (err) {

          logger.trace({
            at: 'healthConsumer:updateHealthStatus',
            conditions: JSON.stringify(conditions),
            update: JSON.stringify(update),
            err: err
          });

          cb(err);
        });

      }

    ],

    cb
  );

}



function deleteFromQueue(queueMsgId, cb) {

  healthQueue()
    .del(queueMsgId, function (err, body) {
      cb(err);
    });
}



function healthConsumerWorker(cb) {

  var queueMsgId;

  async.waterfall(

    [

      function getFromQueue(cb) {

        // get one message at a time
        var opts = {
          n: 1
        };

        healthQueue()
          .get(opts, function (err, res) {

            if (err) return cb(err);

            if (!_.isObject(res) || !res.id) {
              return cb(new QueueError('EMPTY_HEALTH_QUEUE'));
            }

            // store the queue msg id, used to delete the msg from the queue
            queueMsgId = res.id;

            var msgBody = res.body ? JSON.parse(res.body) : {};
            var aid = msgBody.aid;

            // the message body contains the app id
            if (!aid) return cb(new QueueError('APP_ID_NOT_FOUND'));

            cb(null, aid);
          });
      },


      function runGoodHealthQuery(aid, cb) {

        var health = 'good';

        runHealthQuery(aid, health, function (err) {
          cb(err, aid);
        });
      },


      function runAverageHealthQuery(aid, cb) {

        var health = 'average';

        runHealthQuery(aid, health, function (err) {
          cb(err, aid);
        });
      },


      function runBadHealthQuery(aid, cb) {

        var health = 'poor';

        runHealthQuery(aid, health, function (err) {
          cb(err, aid);
        });
      }
    ],


    function callback(err, aid) {


      var emptyQueue = false;


      var finalCallback = function (err) {
        return cb(err, aid, emptyQueue);
      };


      if (err) {

        // if not QueueError, return error without deleting message from queue
        if (err.name !== 'QueueError') return finalCallback(err);


        // if empty error, the queue should be fetched from after some time
        if (err.message === 'EMPTY_HEALTH_QUEUE') {
          emptyQueue = true;
          return finalCallback(err);
        }


        // if any other QueueError, log queue error, delete from queue

        logger.crit({
          at: 'healthConsumer:QueueError',
          err: err,
          aid: aid
        });

      }

      // even if success delete from queue
      deleteFromQueue(queueMsgId, finalCallback);

    }
  );

}


module.exports = function run() {

  async.forever(

    function foreverFunc(next) {

      console.log('\n\n\n');
      logger.trace({
        at: 'healthConsumer:Started'
      });

      healthConsumerWorker(function (err, aid, emptyQueue) {

        var logObj = {
          at: 'healthConsumer:Completed',
          err: err,
          time: Date.now()
        };

        err ? logger.crit(logObj) : logger.trace(logObj);

        // if error is empty queue, then wait for sometime before running the
        // worker again
        if (emptyQueue) {

          setTimeout(next, 300000);

        } else {

          setImmediate(next);
        }
      });
    },

    function foreverCallback(err) {

      logger.fatal({
        at: 'healthConsumer:foreverCallback',
        err: err
      });

    }
  );

};


/**
 * Expose functions for testing
 */

module.exports._runHealthQuery = runHealthQuery;
module.exports._healthConsumerWorker = healthConsumerWorker;
module.exports._healthQueue = healthQueue;
