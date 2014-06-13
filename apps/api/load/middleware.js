/**
 * Module dependencies
 */

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var session = require('express-session');
var cors = require('cors');
var methodOverride = require('method-override');


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

  // enable trust proxy for reverse proxy
  app.enable('trust proxy');

  if (process.env.NODE_ENV === 'development') {
    app.use(logger('dev'));
  }

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded());
  app.use(methodOverride());
  app.use(cookieParser());
  app.use(restErrorMiddleware);

};


/**
 * Adds session middleware specific to dashboard routes
 * @param  {Object} app
 */
module.exports.session = function loadSessionMiddleware(app) {

  /**
   * General config for all apps
   */

  var config = require('../../config')('api');


  /**
   * Cookie domain
   */

  var cookieDomain = config.cookieDomain;


  // Express Session middleware
  // TODO : ADD SESSION CONFIG TO A DIFFERENT FILE
  app.use(session({
    secret: 'HAHAHAHA',
    key: 'dodatado.sid',
    cookie: {
      domain: cookieDomain,
      maxAge: 3600000
    },
    store: sessionStore
  }));

  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

};


/**
 * Adds CORS middleware for requests from
 * app subdomain and root domain of dodatado.com
 * @param {Object} app
 */
module.exports.cors = function loadCorsMiddleware(app) {


  /**
   * General config for all apps
   */

  var config = require('../../config')('api');


  /**
   * CORS whitelist for api routes
   */

  var whitelist = config.corsWhitelist;


  /**
   * CORS settings
   */

  var corsOptions = {
    origin: function (origin, callback) {
      var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
      callback(null, originIsWhitelisted);
    },
    exposedHeaders: ['Set-Cookie', 'set-cookie'],
    credentials: true
  };

  app.use(cors(corsOptions));
};
