var logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser');

module.exports = function loadMiddleware(app) {

  if (process.env.NODE_ENV === 'development') {
    app.use(logger('dev'));
  }

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded());
  app.use(cookieParser());

}
