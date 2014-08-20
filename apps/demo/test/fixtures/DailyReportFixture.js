/**
 * npm dependencies
 */

var async = require('async');
var moment = require('moment');


/**
 * models
 */

var DailyReport = require('../../api/models/DailyReport');


/**
 * create a set of reports in the database
 *
 * @param {string} aid
 * @param {array} uids
 * @param {function} cb callback
 */

module.exports = function (aid, uids, cb) {

  var thisMonth = moment()
    .format();

  var lastMonth = moment()
    .subtract('months', 1)
    .format();


  // updates the default values (0) of score / usage
  function updateReports(aid, uid, timestamp, cb) {

    var totalDays = moment(timestamp)
      .endOf('month')
      .date();

    var year = moment(timestamp)
      .year();

    var month = moment(timestamp)
      .month();

    var count = 1;


    async.whilst(

      function () {
        return count < totalDays;
      },

      function (cb) {
        count++;
        var time = moment([year, month, count])
          .format();
        var score = Math.floor(Math.random() * 100);
        var usage = Math.floor(Math.random() * 1440);

        DailyReport.upsert(aid, uid, undefined, time, score, usage, cb);
      },

      cb
    );


  }


  function createReportsForMonth(timestamp, cb) {

    async.each(

      uids,

      function createReport(uid, cb) {

        var score = Math.floor(Math.random() * 100);
        var usage = Math.floor(Math.random() * 1440);

        DailyReport.upsert(aid, uid, undefined, timestamp, score, usage,
          function (err) {
            if (err) return cb(err);

            updateReports(aid, uid, timestamp, cb);

          });
      },

      cb
    );
  }


  async.series([

    function createReportsForThisMonth(cb) {
      createReportsForMonth(thisMonth, cb);
    },

    function createReportsForLastMonth(cb) {
      createReportsForMonth(lastMonth, cb);
    }

  ], cb);
};
