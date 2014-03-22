/**
 * Module dependencies
 */

var router = require('express')
  .Router(),
  async = require('async');


/**
 * Models
 */

var App = require('../models/App');


/**
 * Policies
 */

var isAuthenticated = require('../policies/isAuthenticated'),
  hasAccess = require('../policies/hasAccess');



/**
 * All routes on /apps
 * need to be authenticated
 */

router.use(isAuthenticated);


/**
 * For all routes with the ':appId'
 * param, we need to check if the
 * logged in user has access to the app
 *
 * The 'hasAccess' policy also attaches the
 * app object to the request object
 * e.g. req.app
 */

router.param('appId', hasAccess);


/**
 * GET /apps
 *
 * Returns all apps belonging to logged in account
 */

router
  .route('/')
  .get(function (req, res, next) {

    var accountId = req.user._id;

    App
      .findByAccountId(accountId, function (err, app) {

        if (err) {
          return next(err);
        }

        if (!app) {
          return res.notFound();
        }

        res.json(app);

      });

  });



/**
 * POST /apps
 *
 * Create a new app belonging to logged in account
 */

router
  .route('/')
  .post(function (req, res, next) {

    var newApp = req.body;


    // add admin to newApp
    newApp.admin = req.user._id;


    App
      .create(newApp, function (err, app) {

        if (err) {
          return next(err);
        }

        // TODO : Send Verification Email Here

        res.json(app, 201);
      });

  });



/**
 * GET /apps/:appId
 *
 * Return app if it belongs to current logged in user
 */

router
  .route('/:appId')
  .get(function (req, res, next) {
    res.json(req.app);
  });


/**
 * PUT /apps/:appId/name
 *
 * Update the name of the app
 */

router
  .route('/:appId/name')
  .put(function (req, res, next) {

    req.app.name = req.body.name;
    req.app.save(function (err, app) {

      if (err) {
        return next(err);
      }

      if (!app) {
        return next(new Error('Error in PUT /apps/:appId/name'));
      }

      res.json(app);

    })
  });


module.exports = router;
