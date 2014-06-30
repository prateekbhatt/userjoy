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


  logger.trace({
    at: 'workers/usage-consumer usageMinutes',
    aid: aid,
    startOfDay: startOfDay,
    endOfDay: endOfDay
  });


  Event
    .aggregate()
    .match({
      aid: aid,
      ct: {
        "$gt": new Date(startOfDay),
        "$lt": new Date(endOfDay)
      }
    })
    .group({
      _id: {

        "u": "$uid",

        "h": {
          "$hour": "$ct"
        },

        "chunk": {
          "$subtract": [

            {
              "$minute": "$ct"
            },

            {
              "$mod": [

                {
                  "$minute": "$ct"
                },

                MINUTES
              ]
            }

          ]
        }

      },
      c: {
        $sum: 1
      }
    })
    .group({
      _id: "$_id.u",
      usage: {
        "$sum": MINUTES
      }
    })
    .exec(cb);
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

            logger.trace({
              at: 'workers/usage-consumer getFromQueue',
              err: err,
              res: res
            });

            if (err) return cb(err);

            if (!_.isObject(res) || !res.id) {
              return cb(new Error('EMPTY_USAGE_QUEUE'));
            }

            // store the queue msg id, used to delete the msg from the queue
            queueMsgId = res.id;

            var msgBody = res.body ? JSON.parse(res.body) : {};
            var aid = msgBody.aid;
            var time = msgBody.time;

            // the message body contains the app id
            if (!aid) return cb(new Error('App id not found in queue'));
            if (!time) return cb(new Error('Time not found in queue'));

            cb(null, aid, time);
          });
      },


      function calculateUsage(aid, time, cb) {
        usageMinutes(aid, time, function (err, users) {
          cb(err, users, aid, time);
        });
      },


      function saveUsageData(users, aid, time, cb) {

        if (_.isEmpty(users)) return cb();

        saveUsage(aid, time, users, function (err) {
          cb(err, aid, time);
        });
      },


      function deleteFromQueue(aid, time, cb) {

        usageQueue()
          .del(queueMsgId, function (err, body) {

            logger.trace({
              at: 'workers/usage-consumer deleteFromQueue',
              queueMsgId: queueMsgId,
              err: err,
              body: body
            });

            cb(err, aid, time);

          });
      },


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

    ],


    function callback(err, aid, time) {

      if (err) {
        logger.crit({
          at: 'workers/usage-consumer callback',
          err: err,
          aid: aid,
          time: time
        });
      }

      cb(err);
    }

  )

}


module.exports = function run() {

  logger.trace('run usageConsumerWorker');

  async.forever(

    function foreverFunc(next) {

      usageConsumerWorker(function (err) {

        if (err) logError(err, true);

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

      logError(err, false);

    }
  );

}

function logError(err, keepAlive) {
  logger.crit({
    at: 'usageConsumerWorker async.forever',
    err: err,
    keepAlive: !! keepAlive,
    time: Date.now()
  });
}


module.exports._saveUsage = saveUsage;
module.exports._scoreQueue = scoreQueue;
module.exports._usageConsumerWorker = usageConsumerWorker;
module.exports._usageMinutes = usageMinutes;
module.exports._usageQueue = usageQueue;
