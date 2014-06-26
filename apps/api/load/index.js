/**
 * npm dependencies
 */

var _ = require('lodash');
var async = require('async');
var express = require('express');
var path = require('path');


var db = require('./db');
var loadMiddleware = require('./middleware');
var loadRoutes = require('../config/routes');


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

  app.set('port', process.env.PORT || 8002);
  setEnv();


  /**
   * run newrelic agent (unless in test environment)
   */

  if (process.env.NODE_ENV !== 'test') {
    require('newrelic');
  }


  // common middleware for all routes
  loadMiddleware.common(app);


  // track routes which do not need session
  loadRoutes.track(app);


  // session middleware required for dashboard routes
  loadMiddleware.session(app);


  // cors middlware to allow requests from app.dodatado.com and dodatado.com
  // to api routes
  loadMiddleware.cors(app);


  // dashboard routes
  loadRoutes.dashboard(app);


  // error handling routes
  loadRoutes.error(app);


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

      }

    ],

    function callback(err, db, server) {

      if (err) {

        logger.crit({
          at: 'load/index',
          err: err
        });

        return (done && done(err));
      };

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
  console.log('   DB Pass           :     ', !!db.pass);
  console.log('-------------------------------------------------');
  console.log();
  console.log();
  console.log();

}
