/**
 * Populates data for the demo account
 */


function bootstrapDevDB(cb) {

  /**
   * npm dependencies
   */

  var async = require('async');
  var request = require('request');


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
  var loginCookie;


  var appLocalUrl = 'http://localhost:8004';

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

        request.post(

          {
            // url: config.appUrl + '/account',
            url: appLocalUrl + '/account',
            method: 'POST',
            json: demoAccount
          },

          function (err, res, body) {

            if (err) return cb(err);
            console.log('\n\n this is working', err, body, '\n\n')

            savedAccount = body['account'];
            savedApp = body['app'];
            aid = savedApp['_id'];

            cb();
          }

        );

      },

      createUsers: function (cb) {

        console.log('loading user fixtures ...', aid);

        createUsers(aid, 100, function (err, uids) {
          if (err) return cb(err);
          userIds = uids;
          cb();
        });

      },

      createEvents: function (cb) {

        console.log('loading event fixtures ...', aid, userIds);

        createEvents(aid, userIds, 10000, cb);
      },


      createReports: function (cb) {
        console.log('loading daily report fixtures ...');

        createDailyReports(aid, userIds, cb);
      },


      login: function (cb) {

        request.post(

          {

            url: appLocalUrl + '/auth/login',
            json: {
              email: 'demo@userjoy.co',
              password: 'demodemo'
            }

          },

          function (err, res, body) {

            loginCookie = res['headers']['set-cookie'];
            console.log('\n\n auth', err, loginCookie);

            cb(err);
          }

        )

      },


      // to create the predefined segments and automessages, we need to $
      // the app
      activateApp: function (cb) {
        console.log('\n\n userjoy activating \n', aid, '\n\n');


        request.put(

          {
            url: appLocalUrl + '/apps/' + aid + '/activate',
            method: 'PUT',
            headers: {
              cookie: loginCookie
            }
          },


          function (err, res, body) {

            console.log('\n\n\n activated', err, '\n\n body::', body,
              '\n\n');
            cb(err);
          }

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
