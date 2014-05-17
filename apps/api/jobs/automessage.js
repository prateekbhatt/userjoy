/**
 * npm dependencies
 */

var _ = require('lodash');
var async = require('async');
var cronJob = require('cron')
  .CronJob;
var iron_mq = require('iron_mq');
var moment = require('moment');


/**
 * Helpers
 */

var logger = require('../helpers/logger');


/**
 * Models
 */

var AutoMessage = require('../api/models/AutoMessage');


/**
 * Config settings
 *
 * TODO: move these to central config settings file
 */

var TOKEN = 'Rfh192ozhicrSZ2R9bDX8uRvOu0';
var PROJECT_ID_DEV = '536e5455bba6150009000090';


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
 * Create iron mq client instance
 */

var imq = new iron_mq.Client({
  token: TOKEN,
  project_id: PROJECT_ID_DEV,
  queue_name: 'automessage'
});


/**
 * use 'automessge' queue on iron mq
 */

var q = imq.queue("automessage");


/**
 * Find all automessages that are active and were last run at least 6 hours ago
 *
 * @param {function} cb callback
 */

function findAutoMessages(cb) {
  logger.trace('Finding automessage cron job');


  // TODO: check if this is working
  var sixHoursAgo = moment()
    .subtract('hours', 6)
    .unix();

  logger.trace(sixHoursAgo);

  AutoMessage
    .find({
      active: true,
      lastRan: {
        $lt: sixHoursAgo
      }
    })
    .select({
      _id: 1
    })
    .exec(cb);

}


/**
 * Iterate over all messages and queue them to ironmq
 *
 * @param {array} msgs all-found-automessages
 * @param {function} cb callback
 */

function queue(msgs, cb) {
  logger.trace('Queuing automessage cron job');

  var iterator = function (m) {

    // post the automessage id in the body
    var body = m._id;

    // post automessage id to queue
    q.post(body, function (err, res) {
      if (err) return cb(err);

      // update the lastQueued timestamp for the AutoMessage
      AutoMessage.updateLastQueued(body, cb);
    });
  };

  async.each(msgs, iterator, cb);

}


/**
 * Cron function to find all valid automessages and put them into queue
 */

function cronFunc() {

  logger.trace('Started automessage cron job');

  var finalCallback = function (err, res) {

    logger.trace('Finished automessage cron job');

    if (err) {
      logger.crit({
        at: 'jobs/automessage',
        err: err,
        ts: Date.now()
      });
    }
  };

  async.waterfall([findAutoMessages, queue], finalCallback);
}


/**
 * Expose cron job with hourly/minutely schedule
 */

module.exports = function () {
  return new cronJob(SCHEDULE, cronFunc, null, true, "");
};
