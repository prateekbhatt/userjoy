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


/**
 * Expose functions for testing
 */

module.exports._mapReduce = mapReduce;
