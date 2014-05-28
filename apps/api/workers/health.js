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
var Health = require('../api/models/Health');


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
    at: 'workers/health usageMinutes',
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

function saveHealth(aid, dailyUsage, cb) {

  var saveIterator = function (user, cb) {

    Health.create({
      aid: aid,
      uid: user._id,
      usage: user.usage
    }, cb);

  };

  async.each(dailyUsage, saveIterator, cb);

}


// function nextUpdateTimestamp(aid, cb) {

//   Health
//     .find({
//       aid: aid
//     })
//     .sort({
//       ct: -1
//     })
//     .limit(1)
//     .exec(function (err, health) {

//       var timestamp;

//       if (err) return cb(err);
//       if (!health || !health[0]) {

//         // if the app is new and does not have usage records, start with
//         // measuring usage of activity from the previous day
//         timestamp = moment()
//           .subtract('days', 1)
//           .format();

//       } else {
//         timestamp = health[0].ct;
//       }

//       cb(null, timestamp);
//     });
// }


function healthWorker(aid, cb) {


  var previousDay = moment()
    .subtract('days', 1)
    .format();


  async.waterfall(

    [

      function calculateUsage(cb) {
        usageMinutes(aid, previousDay, function (err, users) {
          cb(err, users);
        });
      },


      function saveUsageData(users, cb) {

        if (_.isEmpty(users)) return cb();

        saveHealth(aid, users, cb);
      }

    ],


    function callback(err) {

      if (err) {
        logger.crit({
          at: 'workers/health',
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
// module.exports._nextUpdateTimestamp = nextUpdateTimestamp;
module.exports._saveHealth = saveHealth;
module.exports._healthWorker = healthWorker;
