var logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  passport = require('passport'),
  session = require('express-session'),
  restErrorMiddleware = require('../helpers/restErrorMiddleware');

var sessionStore = require('./sessionStore')(session);

module.exports = function loadMiddleware(app) {

  if (process.env.NODE_ENV === 'development') {
    app.use(logger('dev'));
  }

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded());
  app.use(cookieParser());

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

  app.use(restErrorMiddleware);

}
