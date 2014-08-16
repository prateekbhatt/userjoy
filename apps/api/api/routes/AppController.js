/**
 * Module dependencies
 */

var _ = require('lodash');
var async = require('async');
var path = require('path');
var router = require('express')
  .Router();


/**
 * Models
 */

var App = require('../models/App');
var Segment = require('../models/Segment');
var User = require('../models/User');


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
 * Services
 */

var accountMailer = require('../services/account-mailer');


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

        res
          .status(200)
          .json(app);

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


    if (!newApp.subdomain) {
      return res.badRequest('Please provide an email subdomain');
    }

    // add admin to newApp
    newApp.team = [];
    newApp.team.push({
      accid: req.user._id,
      admin: true
    });


    App
      .create(newApp, function (err, app) {

        if (err) {

          if (err.name == 'MongoError' && (err.code == 11000 || err.code ==
            11001)) {

            if (_.contains(err.message, '$subdomain')) {
              return res.badRequest(
                'Please choose a different email subdomain');
            }
          }


          // subdomain must be a single alphanumeric word
          if (err.name === 'ValidationError' && err.errors.subdomain) {
            return res.badRequest(err.errors.subdomain.message);
          }

          return next(err);
        }

        res
          .status(201)
          .json(app);
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
 * PUT /apps/:aid
 *
 * Update the name and subdomain of the default app
 */

router
  .route('/:aid')
  .put(function (req, res, next) {

    req.app.name = req.body.name;
    req.app.subdomain = req.body.subdomain || req.app.subdomain;



    if (!req.app.subdomain) {
      return res.badRequest('App subdomain is required');
    }

    req.app.save(function (err, app) {

      if (err) {

        // subdomain must be a single alphanumeric word
        if (err.name === 'ValidationError' && err.errors.subdomain) {
          return res.badRequest(err.errors.subdomain.message);
        }

        if (err.name == 'MongoError' && (err.code == 11000 || err.code ==
          11001)) {

          if (_.contains(err.message, '$subdomain')) {
            return res.badRequest(
              'Please choose a different email subdomain');
          }
        }

        return next(err);
      }

      if (!app) {
        return next(new Error('Error in PUT /apps/:aid/name'));
      }

      res
        .status(200)
        .json(app);

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

      res
        .status(200)
        .json(app);

    });
  });


/**
 * PUT /apps/:aid/show-message-box
 *
 * @param {Boolean} show true/false
 *
 * Update showMessageBox status of the app
 * Whether to show the message box on the website
 */

router
  .route('/:aid/show-message-box')
  .put(function (req, res, next) {

    var status = req.body.status;

    if (!_.isBoolean(status)) {
      return res.badRequest(
        'Message box status should be either true or false');
    }

    req.app.showMessageBox = status;
    req.app.save(function (err, app) {

      if (err) {
        return next(err);
      }

      if (!app) {
        return next(new Error('Error in PUT /apps/:aid/message-box'));
      }

      res
        .status(200)
        .json(app);

    });
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
      res
        .status(200)
        .json(app);
    });
  });


/**
 * POST /apps/:aid/send-code-to-developer
 *
 * Sends installation code to developer
 */

router
  .route('/:aid/send-code-to-developer')
  .post(function (req, res, next) {


    var aid = req.app._id;
    var email = req.body.email;

    logger.trace({
      at: 'apps:send-install-code',
      aid: aid,
      body: req.body
    });

    var mailerOpts = {
      locals: {
        aid: aid,
        appName: req.app.name,
        fromEmail: req.user.email,
        fromName: req.user.name
      },

      to: {
        email: email
      }
    };

    accountMailer.sendInstallCode(mailerOpts, function (err) {
      if (err) return next(err);
      res
        .status(200)
        .json({
          message: 'Mail sent'
        });
    });

  });


/**
 * PUT /apps/:aid/activate
 *
 * Checks whether userjoy has received any data from the app, if so the isActive
 * status is updated to true.
 *
 * @return {Boolean} isActive
 */

router
  .route('/:aid/activate')
  .put(function (req, res, next) {

    var aid = req.app._id;


    async.waterfall(

      [

        function checkIfAlreadyActive(cb) {
          if (req.app.isActive) {
            return cb(new Error('APP_ALREADY_ACTIVE'));
          }
          cb();
        },

        function checkIfAnyUsers(cb) {
          User
            .findOne({
              aid: aid
            })
            .exec(function (err, usr) {
              cb(err, !! usr);
            });
        },

        function updateStatusIfActive(isActive, cb) {

          // if not active, move on
          if (!isActive) return cb(null, isActive);

          // active, so update active status
          req.app.isActive = isActive;
          req.app.save(function (err) {
            cb(err, isActive);
          });

        },


        function createPredefinedSegments(isActive, cb) {

          // if not active, move on
          if (!isActive) return cb(null, isActive);

          var adminUid = _.find(req.app.team, {
            admin: true
          })
            .accid;

          Segment.createPredefined(aid, adminUid, function (err) {
            cb(err, isActive);
          });
        }
      ],

      function (err, isActive) {

        var sendRes = function (status) {
          return res
            .status(200)
            .json({
              isActive: status
            });
        };

        if (err) {
          if (err.message === 'APP_ALREADY_ACTIVE') return sendRes(true);
          return next(err);
        }

        sendRes(isActive);

      }
    );

  });


module.exports = router;
