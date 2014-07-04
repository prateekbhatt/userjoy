/**
 * npm dependencies
 */

var _ = require('lodash');
var async = require('async');
var moment = require('moment');
var ObjectId = require('mongoose')
  .Types.ObjectId;

/**
 * models
 */

var Event = require('../api/models/Event');
var DailyReport = require('../api/models/DailyReport');


/**
 * Helpers
 */

var logger = require('../helpers/logger');
var QueueError = require('../helpers/queue-error');


/**
 * Constants
 */

var MINUTES = 5;


/**
 * Queues
 */

var q = require('./queues');
var usageQueue = q.usage;
var scoreQueue = q.score;


/**
 * Calculates total usage in minutes / day
 *
 * @param {string} aid app-id
 * @param {date} timestamp is used to calculate the date
 * @param {function} cb callback
 */

function usageMinutes(aid, timestamp, cb) {

  // cast app id into objectid
  aid = new ObjectId(aid);

  // FIXME : CHANGE THIS
  var startOfDay = moment(timestamp)
    .startOf('day')
    .format();


  var endOfDay = moment(timestamp)
    .endOf('day')
    .format();

  Event
    .aggregate()
    .match({
      aid: aid,
      ct: {
        "$gt": new Date(startOfDay),
        "$lt": new Date(endOfDay)
      }
    })
    // .group({
    //   _id: {

    //     "u": "$uid",

    //     "h": {
    //       "$hour": "$ct"
    //     },

    //     "chunk": {
    //       "$subtract": [

    //         {
    //           "$minute": "$ct"
    //         },

    //         {
    //           "$mod": [

    //             {
    //               "$minute": "$ct"
    //             },

    //             MINUTES
    //           ]
    //         }

    //       ]
    //     }

    //   },
    //   c: {
    //     $sum: 1
    //   }
    // })
    // .group({
    //   _id: "$_id.u",
    //   usage: {
    //     "$sum": MINUTES
    //   }
    // })
    .exec(function (err, users) {

      logger.trace({
        at: 'usageConsumer:mapReduce',
        arguments: JSON.stringify(arguments)
      });

    });
}


/*

INPUT:

dailyUsage:

[
  { _id: 5385a6f55ed3949d71e34fa8, usage: 75 },
  { _id: 5385a6f55ed3949d71e34fa7, usage: 75 }
]

 */

function saveUsage(aid, timestamp, dailyUsage, cb) {

  var saveIterator = function (user, cb) {

    var score;
    var usage = user.usage;

    DailyReport.upsert(aid, user._id, undefined, timestamp, score, usage, cb);

  };

  async.each(dailyUsage, saveIterator, cb);

}



function deleteFromQueue(queueMsgId, cb) {

  usageQueue()
    .del(queueMsgId, function (err, body) {
      cb(err);
    });
}


// queue app id to calculate user engagement scores
function postToScoreQueue(aid, time, cb) {

  var appData = {
    aid: aid,
    time: time
  };

  // ironmq accepts only strings
  appData = JSON.stringify(appData);

  scoreQueue()
    .post(appData, function (err) {
      cb(err, aid, time);
    });
}



/**
 * Updates the usage of each user-company
 *
 * @param {function} cb callback
 */

function usageConsumerWorker(cb) {

  var queueMsgId;

  async.waterfall(

    [

      function getFromQueue(cb) {

        // get one message at a time
        var opts = {
          n: 1
        };

        usageQueue()
          .get(opts, function (err, res) {

            if (err) return cb(err);

            if (!_.isObject(res) || !res.id) {
              return cb(new QueueError('EMPTY_USAGE_QUEUE'));
            }

            // store the queue msg id, used to delete the msg from the queue
            queueMsgId = res.id;

            var msgBody = res.body ? JSON.parse(res.body) : {};
            var aid = msgBody.aid;
            var time = msgBody.time;

            // the message body contains the app id
            if (!aid) return cb(new QueueError('APP_ID_NOT_FOUND'));
            if (!time) return cb(new QueueError('TIME_NOT_FOUND'));

            cb(null, aid, time);
          });
      },


      function calculateUsage(aid, time, cb) {
        usageMinutes(aid, time, function (err, users) {

          logger.trace({
            at: 'usageConsumer:calculateUsage',
            users: users,
            aid: aid,
            time: time
          });

          cb(err, users, aid, time);
        });
      },


      function saveUsageData(users, aid, time, cb) {

        if (_.isEmpty(users)) return cb(null, aid, time);

        saveUsage(aid, time, users, function (err) {
          cb(err, aid, time);
        });
      }

    ],


    function callback(err, aid, time) {

      var finalCallback = function (err) {
        return cb(err, aid, time);
      };

      if (err && err.name === 'QueueError') {

        // if empty error, the queue should be fetched from after some time
        if (err.message === 'EMPTY_USAGE_QUEUE') return finalCallback(err);


        // if any other QueueError, delete from queue, and post to score queue
        return deleteFromQueue(queueMsgId, function (err) {

          if (err) return finalCallback(err);
          return postToScoreQueue(aid, time, finalCallback);

        });

      }

      // if err and err is unknown, return error, and do not delete from queue
      return finalCallback(err);


    }

  );

}


module.exports = function run() {

  async.forever(

    function foreverFunc(next) {

      console.log('\n\n\n');
      logger.trace({
        at: 'usageConsumer:Started'
      });


      usageConsumerWorker(function (err, aid, time) {

        var logObject = {
          at: 'usageConsumer:Completed',
          err: err,
          aid: aid,
          time: time
        };

        err ? logger.crit(logObject) : logger.trace(logObject);



        // if error is empty queue, then wait for a minute before running the
        // worker again
        if (err && (err.message === 'EMPTY_USAGE_QUEUE')) {

          setTimeout(next, 3600000);

        } else {

          setImmediate(next);
        }
      });
    },

    function foreverCallback(err) {

      logger.fatal({
        at: 'usageConsumer:foreverCallback',
        err: err
      });

    }
  );

};



module.exports._saveUsage = saveUsage;
module.exports._scoreQueue = scoreQueue;
module.exports._usageConsumerWorker = usageConsumerWorker;
module.exports._usageMinutes = usageMinutes;
module.exports._usageQueue = usageQueue;
