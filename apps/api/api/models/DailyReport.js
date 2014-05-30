/**
 * Model for daily usage and scores of users
 */


/**
 * npm dependencies
 */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;


// schema strict option needs to be set at false to allow du_ and ds_ keys
// to store usage and score values

var schemaOptions = {
  strict: false
};


/**
 * Define schema
 */

var DailyReportSchema = new Schema({


    // app Id
    aid: {
      type: Schema.Types.ObjectId,
      ref: 'App',
      required: [true, 'Invalid aid']
    },


    cid: {
      type: Schema.Types.ObjectId,
      ref: 'Company'
    },


    // minutes of usage
    usage: {
      type: Number,
      default: 0
    },


    y: {
      type: Number,
      min: 2014,
      required: true
    },


    m: {
      type: Number,
      min: 1,
      max: 12,
      required: true
    },


    // created at timestamp
    ct: {
      type: Date,
      default: Date.now
    },


    uid: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Invalid user id']
    }


    // ds_ and du_ keys are added to store the daily usage and score data

  },

  schemaOptions);


/**
 * Preallocate / update daily report documents for the month
 *
 * @param {string} aid app-id
 * @param {string} uid user-id
 * @param {string} cid company-id
 * @param {date} timestamp
 * @param {number} score (0-100)
 * @param {number} usage (0-1440) (a day has 1440 minutes)
 * @param {function} cb callback
 *
 */

DailyReportSchema.statics.upsert = function (aid, uid, cid, timestamp,
  score, usage, cb) {


  if (arguments.length < 7) {
    throw new Error('DailyReport upsert requires all arguments');
  }

  // score must be between (0, 100)
  if (score && (!_.isNumber(score) || score < 0 || score > 100)) {
    return cb(new Error('DailyReport upsert provide valid score'));
  }


  // usage must be between (0, 1440) (a day has 1440 minutes)
  if (usage && (!_.isNumber(usage) || usage < 0 || usage > 1440)) {
    return cb(new Error('DailyReport upsert provide valid usage'));
  }

  var time = moment(timestamp);

  if (!time.isValid()) {
    return cb(new Error('DailyReport upsert provide valid time'));
  }

  var year = time.year();
  var month = time.month();
  var date = time.date();


  // how many days in the current month (used for preallocation)
  var totalDaysInMonth = time.endOf('month')
    .date();


  // query conditions
  var conditions = {
    aid: aid,
    uid: uid,
    y: year,
    m: month
  };


  // if a valid cid is provided
  if (cid) {
    conditions.cid = cid;
  }


  // preallocate month long data
  var setOnInsert = {};

  // set values for current date
  var set = {};


  for (var i = 1; i <= totalDaysInMonth; i++) {

    // skip preallocation for current date
    if (i === date) {

      if (usage) set['du_' + date] = usage;
      if (score) set['ds_' + date] = score;

      continue;
    }

    setOnInsert['du_' + i] = 0;
    setOnInsert['ds_' + i] = 0;
  };


  var update = {
    $setOnInsert: setOnInsert,
    $set: set
  };


  var options = {
    upsert: true
  };


  DailyReport.update(conditions, update, options, cb);

};



var DailyReport = mongoose.model('DailyReport', DailyReportSchema);

module.exports = DailyReport;
