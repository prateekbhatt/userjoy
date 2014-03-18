/**
 * Express routes
 */

var errorHelper = require('../helpers/errorHelper');

var routes = require('include-all')({
  dirname: __dirname + '/../api/routes',
  filter: /(.+)\.js$/,
  excludeDirs: /^\.(git|svn)$/
});

console.log('All route files:', Object.keys(routes));

module.exports = function loadRoutes(app) {

  ////////////////////////////////////////////////////////
  // Define app routers below
  // The will be executed in the order
  // they are defined
  /////////////////////////////////////////////////////////

  app.use('/accounts', routes.account);



  /////////////////////////////////////////////////////////
  // Root url router should be defined at the end
  /////////////////////////////////////////////////////////

  app.use('/', routes.index);

  /////////////////////////////////////////////////////////


  /////////////////////////////////////////////////////////
  // Error handling routes should
  // be defined below



  app.use(function (err, req, res, next) {

    var badRequestErr = errorHelper(err);

    res.json(badRequestErr, badRequestErr.status);

  });

  /// catch 404 and forwarding to error handler
  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  /// error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
      res.json({
        message: err.message,
        error: err
      }, 404);
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function (err, req, res, next) {
    res.json({
      message: err.message,
      error: {}
    }, 404);
  });

}
