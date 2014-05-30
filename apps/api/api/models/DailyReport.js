/**
 * Model for health scores of users
 */


/**
 * npm dependencies
 */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;


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


  // daily usage
  d_u: Schema.Types.Mixed,


  // daily score
  d_s: Schema.Types.Mixed,


  // created at timestamp
  ct: {
    type: Date,
    default: Date.now
  },


  uid: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Invalid user id']
  },

});


/**
 * Preallocate daily report documents for the month
 *
 * @param {string} aid app-id
 * @param {string} uid user-id
 * @param {string} cid company-id
 * @param {number} year (2014-2100)
 * @param {number} month (1-12)
 * @param {function} cb callback
 *
 */

DailyReportSchema.statics.preallocate = function (aid, uid, cid, year, month,
  cb) {

  if (arguments.length < 6) {
    return cb(new Error('DailyReport preallocate requires all arguments'));
  }


  // NOTE: Limit the year between 2014 and 2100
  if (typeof (year) !== 'number' || year < 2014 || year > 2100) {
    return cb(new Error('DailyReport preallocate provide valid year'));
  }


  // in javascript, month varies from 0 to 11
  if (typeof (month) !== 'number' || month < 0 || month > 11) {
    return cb(new Error('DailyReport preallocate provide valid month'));
  }


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


  var totalDaysInMonth = moment({
    year: year,
    month: month
  })
    .endOf('month')
    .date();

  var monthlyPreallocation = {};

  for (var i = 1; i <= totalDaysInMonth; i++) {
    monthlyPreallocation[i] = 0;
  };


  // preallocate month long data
  var setOnInsert = {
    d_s: monthlyPreallocation,
    d_u: monthlyPreallocation
  };


  var update = {
    $setOnInsert: setOnInsert
  };


  var options = {
    upsert: true
  };


  DailyReport.update(conditions, update, options, cb);

};


var DailyReport = mongoose.model('DailyReport', DailyReportSchema);

module.exports = DailyReport;
