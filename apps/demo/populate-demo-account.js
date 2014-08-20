/**
 * Populates data for the demo account
 */


function bootstrapDevDB(cb) {

  /**
   * npm dependencies
   */

  var async = require('async');
  var curl = require('curlrequest');


  /**
   * set env
   */

  process.env.NODE_ENV = 'demo';


  /**
   * load application
   */

  var loadApp = require('./load');


  /**
   * config for the 'demo' app
   */

  var config = require('../config')('demo');


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

      createAccount: function (cb) {

        var demoAccount = {
          name: 'Demo Account',
          email: 'demo@userjoy.co',
          password: 'demodemo'
        };

        curl.request(

          {
            url: config.appUrl + '/account',
            method: 'POST',
            data: demoAccount
          },

          function (err, res) {

            if (err) return cb(err);

            // parse response to JSON
            res = JSON.parse(res);

            savedAccount = res['account'];
            savedApp = res['app'];
            aid = savedApp['_id'];

            cb();
          }

        );

      },

      createUsers: function (cb) {

        console.log('loading user fixtures ...');

        createUsers(aid, 1000, function (err, uids) {
          if (err) return cb(err);
          userIds = uids;
          cb();
        });

      },

      createEvents: function (cb) {

        console.log('loading event fixtures ...');

        createEvents(aid, userIds, 100000, cb);
      },


      createReports: function (cb) {

        console.log('loading daily report fixtures ...');

        createDailyReports(aid, userIds, cb);
      },


      // to create the predefined segments and automessages, we need to activate
      // the app
      activateApp: function (cb) {

        curl.request(

          {
            url: config.appUrl + '/apps/' + aid + '/activate',
            method: 'PUT'
          },

          cb

        );
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
        console.log('');
        console.log('To test cdn app, use the following key:');
        console.log('');
        console.log(savedApp._id);
        console.log('');
        console.log('');

      }

      process.exit( !! err);
    });
}

bootstrapDevDB();
