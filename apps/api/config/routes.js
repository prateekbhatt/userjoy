/**
 * Express routes
 */

var errorHelper = require('../helpers/errorHelper');
var logger = require('../helpers/logger');

var routes = require('include-all')({
  dirname: __dirname + '/../api/routes',
  filter: /(.+)\.js$/,
  excludeDirs: /^\.(git|svn)$/
});

logger.trace(Object.keys(routes));


/**
 * Defines data track routes
 * These routes collect data from the js snippet on users' browsers
 * @param  {Object} app
 */
module.exports.track = function loadTrackRoutes(app) {

  ////////////////////////////////////////////////////////
  // Define data track routes below
  // app.use('/company', routes.TrackController);
  // app.use('/identify', routes.TrackController);
  ////////////////////////////////////////////////////////

  app.use('/track', routes.TrackController);

};


/**
 * Defines dashboard routes
 * These routes work on the DoDataDo dashboard
 * @param  {Object} app
 */
module.exports.dashboard = function loadDashboardRoutes(app) {

  ////////////////////////////////////////////////////////
  // Define dashboard api routes below
  // They will be executed in the order
  // they are defined
  /////////////////////////////////////////////////////////

  app.use('/account', routes.AccountController);

  // "/apps/:aid/invites/"
  //
  // NOTE:
  // GET "/apps/:aid/invites/:inviteId" must not required authentication
  // Hence, InviteController route must be at the top
  app.use('/apps', routes.InviteController);

  app.use('/apps', routes.AppController);

  // "/apps/:aid/conversations/"
  app.use('/apps', routes.ConversationController);

  // "/apps/:aid/automessages/"
  app.use('/apps', routes.AutoMessageController);

  // "/apps/:aid/query/"
  app.use('/apps', routes.QueryController);

  // "/apps/:aid/segments/"
  app.use('/apps', routes.SegmentController);

  // "/apps/:aid/users/"
  app.use('/apps', routes.UserController);

  // "/apps/:aid/users/:uid/notes"
  app.use('/apps', routes.UserNoteController);

  app.use('/auth', routes.AuthController);
  app.use('/mandrill', routes.MandrillController);



  /////////////////////////////////////////////////////////
  // Root url router should be defined at the end
  /////////////////////////////////////////////////////////
  app.use('/', routes.IndexController);
  /////////////////////////////////////////////////////////
};


/**
 * Defines error routes
 * @param  {Object} app
 */
module.exports.error = function loadErrorRoutes(app) {

  ////////////////////////////////////////////////////////
  // Define error handling routes below
  ////////////////////////////////////////////////////////


  app.use(function (err, req, res, next) {

    logger.crit({
      err: err,
      path: req.path,
      body: req.body,
      params: req.params,
      query: req.query
    });

    var badRequestErr = errorHelper(err);
    res.json(badRequestErr, badRequestErr.status);
  });

  /// catch 404 and forwarding to error handler
  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

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

};
