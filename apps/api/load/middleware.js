/**
 * Module dependencies
 */

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var session = require('express-session');


/**
 * Helpers
 */

var restErrorMiddleware = require('../helpers/restErrorMiddleware');


/**
 * Session store config
 */

var sessionStore = require('./sessionStore')(session);


/**
 * Adds middleware common to all routes
 * @param  {Object} app
 */
module.exports.common = function loadCommonMiddleware(app) {

  if (process.env.NODE_ENV === 'development') {
    app.use(logger('dev'));
  }

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded());
  app.use(cookieParser());
  app.use(restErrorMiddleware);

};


/**
 * Adds session middleware specific to dashboard routes
 * @param  {Object} app
 */
module.exports.session = function loadSessionMiddleware(app) {

  // Express Session middleware
  // TODO : ADD SESSION CONFIG TO A DIFFERENT FILE
  app.use(session({
    secret: 'HAHAHAHA',
    cookie: {
      key: 'dodatado.sid',
      maxAge: 60000
    },
    store: sessionStore
  }));

  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

};
