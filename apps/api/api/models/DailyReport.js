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

  var time = moment.utc(timestamp);

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

      if (usage || usage === 0) set['du_' + date] = usage;
      if (score || score === 0) set['ds_' + date] = score;

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


/**
 * NOTE: Does not allow fetching data which is more than 28 days wide
 *
 * @param {string} type must be one of usage / score
 * @param {string} aid app-id
 * @param {string} uid user-id
 * @param {string} cid company-id
 * @param {date} from from-timestamp
 * @param {date} to to-timestamp
 * @param {function} cb callback
 */

DailyReportSchema.statics.get = function (type, aid, uid, cid, from, to, cb) {

  if (!_.contains(['score', 'usage'], type)) {
    return cb(new Error('type must be one of usage / score'))
  }


  // if type is usage, then return du_ values else if type is score, return ds_ values
  var keyShouldStartWith = type === 'usage' ? 'du_' : 'ds_';


  from = moment.utc(from);
  to = moment.utc(to);

  if (!from.isValid() || !to.isValid()) {
    return cb(new Error('Provide valid from/to timestamps'));
  }

  var dayDiff = to.diff(from, 'day');

  if (dayDiff > 28) {

    return cb(new Error(
      'Currently not allowed to get data more than 28 days wide'));
  }


  var fromYear = from.year();
  var fromMonth = from.month();
  var fromUnix = from.unix();

  var toYear = to.year();
  var toMonth = to.month();
  var toUnix = to.unix();

  var timeConditions = [

    {
      y: fromYear,
      m: fromMonth
    },

    {
      y: toYear,
      m: toMonth
    }

  ];


  var conditions = {
    aid: aid,
    uid: uid,
    $or: timeConditions
  };


  if (cid) conditions.cid = cid;


  DailyReport
    .find(conditions)
    .exec(function (err, reports) {

      if (err) return cb(err);

      reports = _.chain(reports)
        .map(function (r) {

          r = r.toJSON();

          var year = r.y;
          var month = r.m;
          var data = {};

          _.each(r, function (val, key) {
            var startsWith = key.indexOf(keyShouldStartWith) === 0;
            var date;
            var time;


            // filter data if key starts with 'du_'
            if (startsWith) {

              date = key.split(keyShouldStartWith)[1];
              time = moment.utc([year, month, date])
                .unix();

              // filter data between the 'from' and the 'to' times
              if (time >= fromUnix && time <= toUnix) {
                data[time] = val;
              }

            }

          });
          return data;
        })
        .reduce(function (result, val, key) {
          _.assign(result, val);
          return result;
        }, {})
        .value();

      cb(err, reports);
    });

};



var DailyReport = mongoose.model('DailyReport', DailyReportSchema);

module.exports = DailyReport;
