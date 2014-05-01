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
  var createSessions = require('./test/fixtures/SessionFixture');


  var savedAccount = {};
  var savedApp = {};
  var uids = [];
  var aid;


  async.series({


      loadApp: function (cb) {
        console.log('loading app ...');
        loadApp.start(cb);
      },

      loadFixtures: function (cb) {

        console.log('loading account, app fixtures ...');

        loadFixtures(function (err, saved) {
          if (err) return cb(err);
          savedAccount = saved.accounts.first;
          savedApp = saved.apps.first;
          savedUser = saved.users.second;
          aid = savedApp._id;
          cb();
        });

      },

      createUsers: function (cb) {

        console.log('loading user fixtures ...');

        createUsers(aid, 1000, function (err, uids) {
          if (err) return cb(err);
          uids = uids;
          uids.push(savedUser._id);
          cb();
        });

      },

      createSessions: function (cb) {

        console.log('loading session fixtures ...');

        createSessions(aid, uids, 100, cb);
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

      }

      process.exit(!!err);
    });
}

bootstrapDevDB();
