/**
 * Checks if the account has access
 * to the given app
 *
 * Attaches the app object to the request object
 *
 * req.app param
 */


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

      if (app.admin.toString() !== req.user._id.toString()) {
        return res.forbidden();
      }

      // Attach the app object to the request object
      req.app = app;

      next();

    });

}
