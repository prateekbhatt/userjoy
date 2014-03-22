var loadApp = require('../load'),
  loadFixtures = require('./fixtures'),
  mongoose = require('mongoose'),
  async = require('async'),
  _ = require('lodash'),

  TEST_URL = 'http://localhost:3000';


/**
 * Drop the test database
 */

function dropTestDb(cb) {
  mongoose.connection.db.dropDatabase(function () {

    console.log();
    console.log('  Dropped DB');
    console.log();
    console.log();

    if (cb) {
      cb();
    }
  });
}


/**
 * Generates a Login user helper
 */

function loginUserGenerator(email, password) {

  return function loginUser(done) {

    request
      .post('/auth/login')
      .send({
        email: email,
        password: password
      })
      .expect({
        message: 'Logged In Successfully'
      })
      .expect(200)
      .end(done);
  };

}


/**
 * Log out user helper
 */

function logoutUser(done) {
  request
    .post('/auth/logout')
    .expect({
      message: 'Logged Out Successfully'
    })
    .expect(200)
    .end(done);
}


/**
 * Add commonly used modules to Globals
 */

function defineGlobals() {
  global.request = require('supertest')
    .agent(TEST_URL);
  global._ = _;
  global.async = async;
  global.dropTestDb = dropTestDb;
  global.logoutUser = logoutUser;
  global.setupTestDb = setupTestDb;
}


/**
 * Start api server
 */

function startServer(done) {
  loadApp.start(done);
}


/**
 * Set node environment to test
 */

function setTestEnv() {
  process.env.NODE_ENV = 'test';
}


function setupTestDb(done) {

  var fixtureData;

  async.series({

    dropTestDb: function (cb) {
      dropTestDb(cb);
    },

    loadFixtures: function (cb) {
      loadFixtures(function (err, savedData) {
        if (err) return cb(err);
        fixtureData = savedData;
        global.savedData = savedData;
        cb();
      });
    },

    loginFunction: function (cb) {

      var firstAccount = fixtureData.accounts.first;

      // add loginUser helper to global
      global.loginUser = loginUserGenerator(firstAccount.email,
        firstAccount.password);
      cb();
    },

    logoutUser: function (cb) {
      logoutUser(cb);
    }

  }, done)

}


/**
 * Define the global before hook
 * for the mocha tests
 */

before(function (done) {

  var fixtureData;

  async.series({

    setTestEnv: function (cb) {
      setTestEnv();
      cb();
    },

    startServer: function (cb) {
      startServer(cb);
    },

    setGlobals: function (cb) {
      defineGlobals();
      cb();
    }

  }, done)

});


/**
 * Define the global after hook
 * for the mocha tests
 */

after(function (done) {
  dropTestDb(done);
});
