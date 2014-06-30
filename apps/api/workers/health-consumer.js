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
    return cb(new Error('Health state must be one of good/average/poor'));
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

        if (!segment) return cb(new Error('Segment not found'));

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
          cb(err);
        });

      }

    ],

    cb
  );

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

            logger.trace({
              at: 'workers/health-consumer getFromQueue',
              err: err,
              res: res
            });

            if (err) return cb(err);

            if (!_.isObject(res) || !res.id) {
              return cb(new Error('EMPTY_HEALTH_QUEUE'));
            }

            // store the queue msg id, used to delete the msg from the queue
            queueMsgId = res.id;

            var msgBody = res.body ? JSON.parse(res.body) : {};
            var aid = msgBody.aid;

            // the message body contains the app id
            if (!aid) return cb(new Error('App id not found in queue'));

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
      },


      function deleteFromQueue(aid, cb) {

        healthQueue()
          .del(queueMsgId, function (err, body) {

            logger.trace({
              at: 'workers/health-consumer deleteFromQueue',
              queueMsgId: queueMsgId,
              err: err,
              body: body
            });

            cb(err, aid);

          });
      },
    ],


    function callback(err, aid) {

      if (err) {
        logger.crit({
          at: 'workers/score-consumer callback',
          err: err,
          aid: aid,
          time: Date.now()
        });
      }

      cb(err);
    }

  );

}


module.exports = function run() {

  logger.trace('run healthConsumerWorker');

  async.forever(

    function foreverFunc(next) {

      healthConsumerWorker(function (err) {

        if (err) logError(err, true);

        setImmediate(next);
      });
    },

    function foreverCallback(err) {

      logError(err, false);

    }
  );

}


function logError(err, keepAlive) {

  logger.crit({
    at: 'healthConsumerWorker async.forever',
    err: err,
    keepAlive: !! keepAlive,
    time: Date.now()
  });
}


/**
 * Expose functions for testing
 */

module.exports._runHealthQuery = runHealthQuery;
module.exports._healthConsumerWorker = healthConsumerWorker;
module.exports._healthQueue = healthQueue;
