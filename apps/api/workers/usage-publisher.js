/**
 * npm dependencies
 */

var _ = require('lodash');
var async = require('async');
var cronJob = require('cron')
  .CronJob;
var moment = require('moment');


/**
 * usage queue
 */

var q = require('./queues')
  .usage;


/**
 * Helpers
 */

var logger = require('../helpers/logger');
var QueueError = require('../helpers/queue-error');


/**
 * Models
 */

var App = require('../api/models/App');


/**
 * Hourly Cron Job
 */

var HOURLY_SCHEDULE = '0 * * * *';


/**
 * Per Minute Cron
 */

var FIVE_MINUTE_SCHEDULE = '*/5 * * * *';


/**
 * Daily cron
 */

var DAILY_SCHEDULE = '0 0 * * *';


// TODO: THIS CODE NEEDS TO BE MANAGED IN INSIDE THE APPS CONFIG FILE
var SCHEDULE = FIVE_MINUTE_SCHEDULE;
if (process.env.NODE_ENV === 'production') {
  SCHEDULE = DAILY_SCHEDULE;
}


/**
 * Find all active apps that have not already been queued for given time
 *
 * @param {date} updateTime start-of-day-updateTime
 * @param {function} cb callback
 */

function findActiveApps(updateTime, cb) {

  App
    .find({
      isActive: true,

      $or: [

        // if it has never been queued
        {
          queuedUsage: {
            $exists: false
          }
        },

        // if it has not been queued for the given time yet
        {
          queuedUsage: {
            $lt: updateTime
          }
        }

      ]
    })
    .select({
      _id: 1
    })
    .lean()
    .exec(cb);

}


/**
 * Cron function to find all apps and put them into queue
 *
 * @param {function} cb optional callback function (used for testing)
 */

function cronFunc(cb) {

  console.log('\n\n\n');
  logger.trace('usagePublisher:Started');

  // update yesterday's usage
  var updateTime = moment.utc()
    .subtract('days', 1)
    .startOf('day')
    .valueOf();

  async.waterfall([

      function find(cb) {
        findActiveApps(updateTime, function (err, apps) {

          if (err) return cb(err);

          if (!_.isObject(apps) || _.isEmpty(apps)) {
            return cb(new QueueError('NO_APPS_FOUND_FOR_QUEUEING'));
          }

          cb(null, apps);
        });
      },

      function queue(apps, cb) {

        var aids = _.pluck(apps, '_id');
        var appsData = _.map(aids, function (id) {

          // add timestamp to app data
          var a = {
            aid: id.toString(),
            updateTime: updateTime
          };

          // iron mq only accepts strings
          return JSON.stringify(a);
        });

        q()
          .post(appsData, function (err, queueIds) {
            cb(err, aids, queueIds, appsData);
          });
      },


      function updateQueuedTimestamp(aids, queueIds, appsData, cb) {
        App.queued(aids, 'usage', updateTime, function (err) {
          cb(err, queueIds, appsData);
        });
      }

    ],

    function finalCallback(err, queueIds, appsData, numberAffected) {

      var logObj = {
        at: 'usagePublisher:Completed',
        err: err,
        queueIds: queueIds,
        appsData: appsData,
        ts: Date.now()
      };

      err ? logger.crit(logObj) : logger.trace(logObj);


      if (cb) {
        return cb(err, queueIds, appsData, numberAffected);
      }

    });
}


/**
 * Expose cron job with daily/minutely schedule
 */

module.exports = function () {
  return new cronJob(SCHEDULE, cronFunc, null, true, "");
};


/**
 * Expose functions for the test cases
 */

module.exports._cronFunc = cronFunc;
module.exports._findActiveApps = findActiveApps;
