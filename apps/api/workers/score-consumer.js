/**
 * npm dependencies
 */

var _ = require('lodash');
var async = require('async');
var moment = require('moment');


/**
 * models
 */

var DailyReport = require('../api/models/DailyReport');


/**
 * Helpers
 */

var logger = require('../helpers/logger');


/**
 * Queues
 */

var q = require('./queues');
var healthQueue = q.health;
var scoreQueue = q.score;


/**
 * Constants
 */

var NO_OF_DAYS = 14;
var USAGE_KEY_PREFIX = 'du_';


/*
INPUT: instance of a moment timestamp
OUTPUT: date in the format YYYYMMDD

where MM is 05 for June, 00 for January

Using moment(timestamp).format('YYYYMMDD') makes MM into 01 for January (we dont
want that)

 */

function getDateEquivalent(momentTime) {
  var month = momentTime.month()
    .toString();

  var year = momentTime.year()
    .toString();

  var date = momentTime.date()
    .toString();

  if (month.length === 1) month = '0' + month;
  if (date.length === 1) date = '0' + date;

  return parseInt(year + month + date, 10);
}


/**
 * For 'timestamp' date, calculate the engagement score for all users of the app
 *
 * Engagement Score is calculated by taking the total usage of all users of the
 * app in the last 14 days, and then normalizing it on a scale of 0 t0 100.
 *
 * The user with the highest usage gets a score of 100 and the user with the
 * lowest engagement gets a score of 0
 *
 * @param {string} aid app-id
 * @param {string} cid company-id (optional, could be null)
 * @param {date} timestamp the date for which the score should be calculated
 * @param {function} cb callback
 *
 */

function mapReduce(aid, cid, timestamp, cb) {

  var to = moment(timestamp);

  if (!to.isValid()) {
    return cb(new Error('Provide valid timestamp'));
  }

  var from = moment(timestamp)
    .subtract('days', NO_OF_DAYS);

  var timeConditions = [

    {
      y: from.year(),
      m: from.month()
    },

    {
      y: to.year(),
      m: to.month()
    }
  ];


  // define the map reduce object
  var o = {};

  var fromDate = getDateEquivalent(from);
  var toDate = getDateEquivalent(to);

  o.scope = {
    // from date
    FROM: fromDate,

    // to date
    TO: toDate,

    // initialize min to the maximum possible value, i.e. total usage in the
    // last 14 days in minutes
    MIN: (60 * 24 * NO_OF_DAYS),

    // initialize max to the minimum possible value
    MAX: 0,

    USAGE_KEY_PREFIX: USAGE_KEY_PREFIX
  };

  o.query = {
    aid: aid,
    $or: timeConditions
  };

  if (cid) o.query.cid = cid;


  // get the usage scores of the last 14 days grouped by uids
  o.map = function (err) {

    var year = this.y.toString();
    var month = this.m.toString();

    // if month is '5', convert it into '05'
    if (month.length === 1) month = '0' + month;

    for (var key in this) {

      if (this.hasOwnProperty(key) && (key.indexOf(USAGE_KEY_PREFIX) === 0)) {


        // if key is 'du_2', date is '2'
        var date = key.split(USAGE_KEY_PREFIX)[1];


        // if date is '2', convert it to '02'
        if (date.length === 1) date = '0' + date;


        // if year='2014', month='05', date='02',
        // final date is 20140502 (number)
        date = parseInt(year + month + date, 10);


        // if date is within FROM and TO, emit it with the usage for that day
        if (date > FROM && date <= TO) {
          emit(this.uid, this[key]);
        }

      }
    }

  };


  // calculate the sum of usage in the last 14 days for each user
  o.reduce = function (uid, usageVals) {
    var sum = Array.sum(usageVals);
    if (sum > MAX) MAX = sum;
    if (sum < MIN) MIN = sum;
    return sum;
  };


  // normalize the usage on a scale of 0-100 for all users
  o.finalize = function (uid, sum) {
    var normalize = (sum - MIN) * 100 / (MAX - MIN);
    return normalize;
  };


  DailyReport.mapReduce(o, cb)

}


/*

INPUT:

scores:

[
  { _id: 5385a6f55ed3949d71e34fa8, score: 100 },
  { _id: 5385a6f55ed3949d71e34fa7, score: 0 }
]

 */

function saveScores(aid, cid, timestamp, scores, cb) {

  var saveIterator = function (score, cb) {

    var uid = score._id;
    var score = score.value;
    var usage;

    DailyReport.upsert(aid, uid, cid, timestamp, score, usage, cb);

  };

  async.each(scores, saveIterator, cb);

}


function scoreConsumerWorker(cb) {

  var queueMsgId;

  // TODO: cid is always being taken as null as of now
  var cid = null;


  async.waterfall(

    [


      function getFromQueue(cb) {

        // get one message at a time
        var opts = {
          n: 1
        };

        scoreQueue()
          .get(opts, function (err, res) {

            logger.trace({
              at: 'workers/score-consumer getFromQueue',
              err: err,
              res: res
            });

            if (err) return cb(err);

            if (!_.isObject(res) || !res.id) {
              return cb(new Error('EMPTY_SCORE_QUEUE'));
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


      function runMapReduce(aid, time, cb) {

        // TODO: cid is hardcoded as null
        mapReduce(aid, null, time, function (err, scores) {
          cb(err, scores, aid, time);
        });
      },


      function saveData(scores, aid, time, cb) {
        // TODO: cid is hardcoded as null
        saveScores(aid, null, time, scores, function (err) {
          cb(err, aid, time);
        });
      },


      function deleteFromQueue(aid, time, cb) {

        scoreQueue()
          .del(queueMsgId, function (err, body) {

            logger.trace({
              at: 'workers/score-consumer deleteFromQueue',
              queueMsgId: queueMsgId,
              err: err,
              body: body
            });

            cb(err, aid, time);

          });
      },


      // queue app id to calculate user health attribute
      function postToHealthQueue(aid, time, cb) {

        var appData = {
          aid: aid
        };

        // ironmq accepts only strings
        appData = JSON.stringify(appData);

        healthQueue()
          .post(appData, function (err) {
            cb(err, aid, time);
          });
      }
    ],


    function callback(err, aid, time) {

      if (err) {
        logger.crit({
          at: 'workers/score-consumer callback',
          err: err,
          aid: aid,
          time: time
        });
      }

      cb(err);
    }

  );

}


module.exports = function run() {

  logger.trace('run scoreConsumerWorker');

  async.forever(

    function foreverFunc(next) {

      scoreConsumerWorker(function (err) {

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
    at: 'scoreConsumerWorker async.forever',
    err: err,
    keepAlive: !! keepAlive,
    time: Date.now()
  });

}


/**
 * Expose functions for testing
 */

module.exports._healthQueue = healthQueue;
module.exports._mapReduce = mapReduce;
module.exports._scoreConsumerWorker = scoreConsumerWorker;
module.exports._scoreQueue = scoreQueue;
