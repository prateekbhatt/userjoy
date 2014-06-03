/**
 * Module dependencies
 */

var async = require('async');
var path = require('path');
var router = require('express')
  .Router();


/**
 * Models
 */

var App = require('../models/App');


/**
 * Policies
 */

var isAuthenticated = require('../policies/isAuthenticated');
var hasAccess = require('../policies/hasAccess');


/**
 * Helpers
 */

var logger = require('../../helpers/logger');


/**
 * All routes below need to be authenticated
 */

router.use(isAuthenticated);


/**
 * For all routes with the ':aid'
 * param, we need to check if the
 * logged in user has access to the app
 *
 * The 'hasAccess' policy also attaches the
 * app object to the request object
 * e.g. req.app
 */

router.param('aid', hasAccess);


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
    newApp.team = [];
    newApp.team.push({
      accid: req.user._id,
      admin: true
    });


    App
      .create(newApp, function (err, app) {

        if (err) {
          return next(err);
        }

        res.json(app, 201);
      });

  });



/**
 * GET /apps/:aid
 *
 * Return app if it belongs to current logged in user
 */

router
  .route('/:aid')
  .get(function (req, res, next) {

    var populate = {
      path: 'team.accid',
      select: 'name email'
    };

    req.app.populate(populate, function (err, app) {

      if (err) return next(err);

      res
        .status(200)
        .json(req.app);
    });

  });


/**
 * PUT /apps/:aid/name
 *
 * Update the name of the app
 */

router
  .route('/:aid/name')
  .put(function (req, res, next) {

    req.app.name = req.body.name;
    req.app.save(function (err, app) {

      if (err) {
        return next(err);
      }

      if (!app) {
        return next(new Error('Error in PUT /apps/:aid/name'));
      }

      res.json(app);

    })
  });


/**
 * PUT /apps/:aid/color
 *
 * Update the color theme for the app
 */

router
  .route('/:aid/color')
  .put(function (req, res, next) {

    var color = req.body.color;

    // length must be 7, #FFFFFF
    if (!color || color.length !== 7) {
      return res.badRequest('Provide valid color code');
    }

    req.app.color = color;
    req.app.save(function (err, app) {
      if (err) return next(err);
      res.json(app);
    });
  });


module.exports = router;
