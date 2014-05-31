/**
 * Bootstraps database for the development environment
 */


function bootstrapDevDB(cb) {

  /**
   * npm dependencies
   */

  var async = require('async');


  /**
   * set env
   */

  process.env.NODE_ENV = 'development';


  /**
   * load application
   */

  var loadApp = require('./load');


  /**
   * fixtures
   */

  var loadFixtures = require('./test/fixtures');
  var createUsers = require('./test/fixtures/UserFixture');
  var createEvents = require('./test/fixtures/EventFixture');
  var createDailyReports = require('./test/fixtures/DailyReportFixture');

  var saved; // saved data in the main fixture
  var savedAccount = {};
  var savedApp = {};
  var userIds = [];
  var aid;


  async.series({


      loadApp: function (cb) {
        console.log('loading app ...');
        loadApp.start(cb);
      },

      loadFixtures: function (cb) {

        console.log('loading account, app fixtures ...');

        loadFixtures(function (err, sav) {
          if (err) return cb(err);
          saved = sav;
          savedAccount = sav.accounts.first;
          savedApp = sav.apps.first;
          savedUser = sav.users.second;
          aid = savedApp._id;
          cb();
        });

      },

      createUsers: function (cb) {

        console.log('loading user fixtures ...');

        createUsers(aid, 100, function (err, uids) {
          if (err) return cb(err);
          userIds = uids;
          userIds.push(savedUser._id);
          cb();
        });

      },

      createEvents: function (cb) {

        console.log('loading event fixtures ...');

        createEvents(aid, userIds, 10000, cb);
      },


      createReports: function (cb) {

        console.log('loading daily report fixtures ...');

        createDailyReports(aid, userIds, cb);
      }

    },

    function (err) {

      if (err) {

        console.log('\n\nERROR:\n');
        console.log(err);

      } else {

        console.log('\n\n');
        console.log('Use the following account:');
        console.log('');
        console.log('email:', savedAccount.email);
        console.log('password:', savedAccount.password);
        console.log('\n');
        console.log('To test email use the following user:');
        console.log('');
        console.log('uid:', savedUser._id);
        console.log('email:', savedUser.email);
        console.log('');
        console.log('');
        console.log('');

      }

      process.exit(!!err);
    });
}

bootstrapDevDB();
