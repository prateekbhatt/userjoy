/**
 * npm dependencies
 */

var _ = require('lodash');
var async = require('async');
var express = require('express');
var path = require('path');


// WARNING: require db connection from the api app. This is because all mongoose
// models are defined in the connections are defined in the api app. Hence, the
// db connection can only be referenced from the api app
var db = require('../../api/load/db');


/**
 * directory path var
 */

var workersDir = '../../api/workers/';


/**
 * Jobs
 */

var automessageConsumer = require(path.join(workersDir,
  '/automessage-consumer'));

var automessagePublisher = require(path.join(workersDir,
  '/automessage-publisher'));

var healthConsumer = require(path.join(workersDir, '/health-consumer'));
var scoreConsumer = require(path.join(workersDir, '/score-consumer'));
var usageConsumer = require(path.join(workersDir, '/usage-consumer'));
var usagePublisher = require(path.join(workersDir, '/usage-publisher'));


/**
 * Helpers
 */

var logger = require('../helpers/logger');


/**
 * If NODE_ENV has not already been defined,
 * then set default environment as 'development'
 */

function setEnv() {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
  }
}

/**
 * Start app server
 */

exports.start = function startServer(done) {

  var app = express();

  app.set('port', process.env.PORT || 8003);
  setEnv();


  /**
   * run newrelic agent (unless in test environment)
   */

  if (process.env.NODE_ENV !== 'test') {
    require('newrelic');
  }


  async.waterfall(

    [

      function connectDB(cb) {

        db.connect(function (err, db) {
          cb(err, db);
        });

      },

      function startServer(db, cb) {

        var server = app.listen(app.get('port'), function () {
          cb(null, db, server);
        });

      },

      function startWorkers(db, server, cb) {

        automessageConsumer();
        automessagePublisher();
        healthConsumer();
        scoreConsumer();
        usageConsumer();
        usagePublisher();

        cb(null, db, server);
      }

    ],

    function callback(err, db, server) {

      if (err) {

        logger.crit({
          at: 'workers load/index',
          err: err
        });

        return (done && done(err));
      }

      printMessage(db, app);
      done && done(null, db, app);

    });


}


/**
 * Stop app server
 */

// exports.stop = function stopServer(done) {

//   console.log('-------------------------------------------------');
//   console.log('   Shutting down server');
//   console.log('-------------------------------------------------');

//   process.exit(0);

// }


function printMessage(db, app) {

  console.log();
  console.log('-------------------------------------------------');
  console.log('   Express server listening');
  console.log();
  console.log('   Port              :     ', app.get('port'));
  console.log('   Environment       :     ', process.env.NODE_ENV);
  console.log('   DB Name           :     ', db.name);
  console.log('   DB Host           :     ', db.host);
  console.log('   DB Port           :     ', db.port);
  console.log('   DB Hosts          :     ', db.hosts);
  console.log('   DB User           :     ', db.user);
  console.log('   DB Pass           :     ', !! db.pass);
  console.log('-------------------------------------------------');
  console.log();
  console.log();
  console.log();

}
