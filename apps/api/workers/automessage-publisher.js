/**
 * npm dependencies
 */

var _ = require('lodash');
var async = require('async');
var cronJob = require('cron')
  .CronJob;
var moment = require('moment');
var q = require('./queues')
  .automessage;


/**
 * Helpers
 */

var logger = require('../helpers/logger');
var QueueError = require('../helpers/queue-error');


/**
 * Models
 */

var AutoMessage = require('../api/models/AutoMessage');


/**
 * Hourly Cron Job
 */

var HOURLY_SCHEDULE = '0 * * * *';


/**
 * Per Minute Cron
 */

var MINUTE_SCHEDULE = '*/1 * * * *';


// TODO: THIS CODE NEEDS TO BE MANAGED IN INSIDE THE APPS CONFIG FILE
var SCHEDULE = MINUTE_SCHEDULE;
if (process.env.NODE_ENV === 'production') {
  SCHEDULE = HOURLY_SCHEDULE;
}


/**
 * Find all automessages that are active and were last run at least 6 hours ago
 *
 * @param {function} cb callback
 */

function findAutoMessages(cb) {

  // TODO: check if this is working
  var sixHoursAgo = moment()
    .subtract('hours', 6)
    .unix();

  AutoMessage
    .find({
      active: true,
      lastQueued: {
        $lt: sixHoursAgo
      }
    })
    .select({
      _id: 1
    })
    .exec(cb);

}


/**
 * updates the 'lastQueued' timestamp for all given automessages
 *
 * @param {array} ids automessage ids
 * @param {function} cb callback
 */

function updateLastQueued(ids, cb) {

  var query = {
    _id: {
      $in: ids
    }
  };

  var update = {
    $set: {
      lastQueued: Date.now()
    }
  };

  var options = {
    multi: true
  };


  AutoMessage
    .update(query, update, options, function (err, numberAffected) {
      cb(err, numberAffected);
    });
}


/**
 * Cron function to find all valid automessages and put them into queue
 *
 * @param {function} cb optional callback function (used for testing)
 */

function cronFunc(cb) {

  console.log('\n\n\n');
  logger.trace('amPublisher:Started');

  async.waterfall([

      function find(cb) {
        findAutoMessages(function (err, amsgs) {
          if (err) return cb(err);
          if (_.isEmpty(amsgs)) {
            return cb(new QueueError('NO_AUTOMESSAGES_FOR_QUEUEING'));
          }
          cb(null, amsgs);
        });
      },

      function queue(msgs, cb) {

        var ids = _.chain(msgs)
          .pluck('_id')
          .map(function (id) {
            return id.toString();
          })
          .value();

        q()
          .post(ids, function (err, queueIds) {
            cb(err, queueIds, ids);
          });
      },

      function updateTime(queueIds, ids) {
        updateLastQueued(ids, function (err, numberAffected) {
          cb(err, queueIds, ids, numberAffected);
        });
      }


    ],

    function finalCallback(err, queueIds, ids, numberAffected) {

      var logObj = {
        at: 'amPublisher:Completed',
        err: err,
        ts: Date.now()
      };

      err ? logger.crit(logObj) : logger.trace(logObj);

      if (cb) {
        return cb(err, queueIds, ids, numberAffected);
      }

    });
}


/**
 * Expose cron job with hourly/minutely schedule
 */

module.exports = function () {
  return new cronJob(SCHEDULE, cronFunc, null, true, "");
};


/**
 * Expose functions for the test cases
 */

module.exports._cronFunc = cronFunc;
module.exports._findAutoMessages = findAutoMessages;
module.exports._updateLastQueued = updateLastQueued;
