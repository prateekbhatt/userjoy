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

var App = require('../api/models/App');
var DailyReport = require('../api/models/DailyReport');
var Event = require('../api/models/Event');
var User = require('../api/models/User');


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

function usageMinutes(aid, updateTime, cb) {

  // cast app id into objectid
  aid = new ObjectId(aid);

  var startOfDay = moment.utc(updateTime)
    .startOf('day')
    .format();

  var endOfDay = moment.utc(updateTime)
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
    .exec(function (err, users) {

      logger.trace({
        at: 'usageConsumer:mapReduce',
        arguments: JSON.stringify(arguments)
      });

      cb(err, users);

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

function saveUsage(aid, updateTime, dailyUsage, cb) {

  var saveIterator = function (user, cb) {

    var score;
    var usage = user.usage;

    DailyReport.upsert(aid, user._id, undefined, updateTime, score, usage, cb);

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
function postToScoreQueue(aid, updateTime, cb) {

  var appData = {
    aid: aid,
    updateTime: updateTime
  };

  // ironmq accepts only strings
  appData = JSON.stringify(appData);

  scoreQueue()
    .post(appData, function (err) {
      cb(err, aid, updateTime);
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
            var updateTime = msgBody.updateTime;

            // the message body contains the app id
            if (!aid) {
              return cb(new QueueError('APP_ID_NOT_FOUND'));
            }

            if (!updateTime) {
              return cb(new QueueError('UPDATE_TIME_NOT_FOUND'));
            }

            cb(null, aid, updateTime);
          });
      },


      function calculateUsage(aid, updateTime, cb) {
        usageMinutes(aid, updateTime, function (err, users) {
          cb(err, users, aid, updateTime);
        });
      },


      function getAllUsers(activeUsers, aid, updateTime, cb) {

        // get the ids of all users who did some activity on the given day
        var userIds = _.chain(activeUsers)
          .pluck('_id')
          .map(function (id) {
            return id.toString();
          })
          .value();


        // get the ids of all users of app who did not do any activity on the
        // given day. their usage should be set to 0.
        User
          .find({
            aid: aid,
            _id: {
              $nin: userIds
            }
          })
          .select('_id')
          .lean()
          .exec(function (err, usrs) {

            if (err) return cb(err);

            usrs = _.each(usrs, function (u) {
              u.usage = 0;
              return u;
            });

            var allUsers = usrs.concat(activeUsers);

            cb(err, allUsers, aid, updateTime);

          });

      },


      function saveUsageData(users, aid, updateTime, cb) {

        logger.trace({
          at: 'usage:consumer:saveUsageData',
          users: users,
          aid: aid,
          updateTime: updateTime
        });

        if (_.isEmpty(users)) return cb(new QueueError('NO_USERS_FOUND'));

        saveUsage(aid, updateTime, users, function (err) {
          cb(err, aid, updateTime);
        });
      }

    ],


    function callback(err, aid, updateTime) {


      var emptyQueue = false;


      var finalCallback = function (err) {
        return cb(err, aid, updateTime, emptyQueue);
      };


      if (err) {

        // if not QueueError, return error without deleting message from queue
        if (err.name !== 'QueueError') {
          return finalCallback(err, aid, updateTime);
        }

        // if empty queue error, the queue should be fetched from after some time
        if (err.message === 'EMPTY_USAGE_QUEUE') emptyQueue = true;


        // if any QueueError, log queue error,
        // and move on and delete from usage queue, and post to score queue

        logger.crit({
          at: 'usageConsumer:QueueError',
          err: err,
          aid: aid,
          updateTime: updateTime
        });

      }


      // if QueueError or success, delete from usage queue, and post to score queue

      async.series(

        [

          function deleteFromUsageQueue(cb) {
            deleteFromQueue(queueMsgId, cb);
          },

          function toScoreQueue(cb) {
            postToScoreQueue(aid, updateTime, cb);
          },

          function updateQueuedScore(cb) {
            App.queued(aid, 'score', updateTime, cb);
          }

        ],

        finalCallback

      );
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


      usageConsumerWorker(function (err, aid, updateTime, emptyQueue) {

        var logObject = {
          at: 'usageConsumer:Completed',
          err: err,
          aid: aid,
          updateTime: updateTime
        };

        err ? logger.crit(logObject) : logger.trace(logObject);



        // if error is empty queue, then wait for a minute before running the
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
