/**
 * Bootstrap the test database
 * before running tests
 */


/**
 * npm dependencies
 */

var async = require('async');


/**
 * models
 */

var Account = require('../../api/models/Account');
var App = require('../../api/models/App');


var accounts = {

  first: {
    name: 'Prateek',
    email: 'test@userjoy.co',
    password: 'testtest'
  },

  second: {
    name: 'Savinay',
    email: 'savinay@example.com',
    password: 'newapptest'
  },
},

  apps = {

    first: {
      name: 'First App',
      domain: 'firstapp.co'
    },

    second: {
      name: 'Second App',
      domain: 'secondapp.co'
    }
  };


function createAccount(account, fn) {

  var rawPassword = account.password;
  Account.create(account, function (err, acc) {
    if (err) return fn(err);
    acc.password = rawPassword;
    fn(null, acc);
  });

}

function createApp(accId, app, fn) {

  app.admin = accId;
  App.create(app, fn);

}


module.exports = function loadFixtures(callback) {

  async.series({

    createFirstAccount: function (cb) {

      createAccount(accounts.first, function (err, acc) {
        if (err) return cb(err);
        accounts.first = acc;
        cb();
      });

    },

    createSecondAccount: function (cb) {

      createAccount(accounts.second, function (err, acc) {
        if (err) return cb(err);
        accounts.second = acc;
        cb();
      });

    },

    createFirstApp: function (cb) {

      createApp(accounts.first._id, apps.first, function (err, app) {
        if (err) return cb(err);
        apps.first = app;
        cb();
      });

    },

    createSecondApp: function (cb) {

      createApp(accounts.second._id, apps.second, function (err, app) {
        if (err) return cb(err);
        apps.second = app;
        cb();
      });

    },

  }, function (err) {

    callback(err, {
      accounts: accounts,
      apps: apps
    });

  });
}
