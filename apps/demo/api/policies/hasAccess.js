/**
 * Checks if the account has access
 * to the given app
 *
 * Attaches the app object to the request object
 *
 * req.app param
 */


/**
 * npm dependencies
 */

var _ = require('lodash');


/**
 * Models
 */

var App = require('../models/App');


module.exports = function hasAccess(req, res, next, aid) {

  App
    .findById(aid)
    .exec(function (err, app) {

      if (err) {
        return next(err);
      }

      if (!app) {
        return res.notFound();
      }

      var isTeamMember = _.find(app.team, { accid: req.user._id });

      if (!isTeamMember) {
        return res.forbidden();
      }

      // Attach the app object to the request object
      req.app = app;

      next();

    });

}
