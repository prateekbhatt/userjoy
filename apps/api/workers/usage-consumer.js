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
 * @param {date} timestamp day for which to update usage
 * @param {function} cb callback
 */

function usageConsumerWorker(timestamp, cb) {

  var queueMsgId;
  var time = moment(timestamp)
    .format();

  async.waterfall(

    [

      function getFromQueue(cb) {

        // get one message at a time
        var opts = {
          n: 1
        };

        usageQueue.get(opts, function (err, res) {

          logger.trace({
            at: 'workers/usage-consumer getFromQueue',
            err: err,
            res: res
          });

          if (err) return cb(err);

          // store the queue msg id, used to delete the msg from the queue
          queueMsgId = res.id;

          // the message body contains the app id
          if (!res.body) {
            return cb(new Error('App id not found in queue'));
          }

          cb(null, res.body);
        });
      },


      function calculateUsage(aid, cb) {
        usageMinutes(aid, time, function (err, users) {
          console.log('\n\n\n calculating usage minutes', err, users.length);
          cb(err, users, aid);
        });
      },


      function saveUsageData(users, aid, cb) {

        if (_.isEmpty(users)) return cb();

        saveUsage(aid, time, users, function (err) {
          cb(err, aid);
        });
      },


      function deleteFromQueue(aid, cb) {

        usageQueue.del(queueMsgId, function (err, body) {

          logger.trace({
            at: 'workers/usage-consumer deleteFromQueue',
            queueMsgId: queueMsgId,
            err: err,
            body: body
          });

          cb(err, aid);

        });
      },


      // queue app id to calculate user engagement scores
      function postToScoreQueue(aid, cb) {
        scoreQueue.post(aid, function (err) {
          cb(err, aid);
        });
      }

    ],


    function callback(err, aid) {

      if (err) {
        logger.crit({
          at: 'workers/usage-consumer callback',
          err: err,
          aid: aid,
          ts: Date.now()
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
        setImmediate(next);
      });
    },

    function foreverCallback(err) {

      logger.crit({
        at: 'usageConsumerWorker async.forever',
        err: err,
        time: Date.now()
      });

    }
  );

}


module.exports._saveUsage = saveUsage;
module.exports._scoreQueue = scoreQueue;
module.exports._usageConsumerWorker = usageConsumerWorker;
module.exports._usageMinutes = usageMinutes;
module.exports._usageQueue = usageQueue;
