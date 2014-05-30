/**
 * npm dependencies
 */

var _ = require('lodash');
var async = require('async');
var moment = require('moment');


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
 * Calculates total usage in minutes / day
 *
 * @param {string} aid app-id
 * @param {date} timestamp is used to calculate the date
 * @param {function} cb callback
 */

function usageMinutes(aid, timestamp, cb) {

  // FIXME : CHANGE THIS
  var startOfDay = moment(timestamp)
    .startOf('day')
    .format();


  var endOfDay = moment(timestamp)
    .endOf('day')
    .format();


  logger.trace({
    at: 'workers/usage-consumer usageMinutes',
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
 * @param {string} aid app-id
 * @param {date} timestamp day for which to update usage
 * @param {function} cb callback
 */

function usageConsumerWorker(aid, timestamp, cb) {

  var time = moment(timestamp)
    .format();

  async.waterfall(

    [

      function calculateUsage(cb) {
        usageMinutes(aid, time, function (err, users) {
          cb(err, users);
        });
      },


      function saveUsageData(users, cb) {

        if (_.isEmpty(users)) return cb();

        saveUsage(aid, time, users, cb);
      }

    ],


    function callback(err) {

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


module.exports._usageMinutes = usageMinutes;
module.exports._saveUsage = saveUsage;
module.exports._usageConsumerWorker = usageConsumerWorker;
