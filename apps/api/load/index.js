/**
 * Module dependencies
 */

var express = require('express'),
  path = require('path'),
  loadMiddleware = require('./middleware'),
  loadRoutes = require('../config/routes'),
  db = require('./db'),
  async = require('async');


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

  app.set('port', process.env.PORT || 3000);
  setEnv();

  loadMiddleware(app);
  loadRoutes(app);

  async.waterfall([

    function (cb) {

      db.connect(function (err, db) {
        cb(err, db);
      });

    },

    function (db, cb) {

      var server = app.listen(app.get('port'), function () {
        cb(null, db, app, server);
      });

    }

  ], function (err, db, app, server) {

    if (err) {
      return done(err);
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
  console.log('   Database          :     ', db.name);
  console.log('-------------------------------------------------');
  console.log();
  console.log();
  console.log();

}
