/**
 * npm dependencies
 */

var _ = require('lodash');
var async = require('async');
var router = require('express')
  .Router();


/**
 * Models
 */

var AutoMessage = require('../models/AutoMessage');


/**
 * Policies
 */

var hasAccess = require('../policies/hasAccess');
var isAuthenticated = require('../policies/isAuthenticated');


/**
 * Helpers
 */

var logger = require('../../helpers/logger');


/**
 * Services
 */

var automessage = require('../services/automessage');


/**
 * All routes on /apps
 * need to be authenticated
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
 * GET /apps/:aid/automessages
 *
 * Returns all auto-messages for the app
 */

router
  .route('/:aid/automessages')
  .get(function (req, res, next) {

    var aid = req.app._id;

    AutoMessage
      .find({
        aid: aid
      })
      .exec(function (err, automessages) {
        if (err) return next(err);
        res
          .status(200)
          .json(automessages);
      });

  });


/**
 * GET /apps/:aid/automessages/:amId
 *
 * Returns a automessage
 */

router
  .route('/:aid/automessages/:amId')
  .get(function (req, res, next) {

    var aid = req.app._id;
    var amId = req.params.amId;

    AutoMessage
      .findById(amId)
      .exec(function (err, automsg) {
        if (err) return next(err);
        res
          .status(200)
          .json(automsg);
      })


  });


/**
 * POST /apps/:aid/automessages
 *
 * Creates a new automessage
 */

router
  .route('/:aid/automessages')
  .post(function (req, res, next) {

    logger.debug('creating new automessage');

    var newAutoMessage = req.body;
    var accid = req.user._id;
    var aid = req.app._id;


    AutoMessage
      .create(newAutoMessage, function (err, savedAutoMsg) {
        if (err) return next(err);
        res
          .status(201)
          .json(savedAutoMsg);
      });

  });


/**
 * PUT /apps/:aid/automessages/:amId/send
 *
 * Sends a test automessage
 */

router
  .route('/:aid/automessages/:amId/send-test')
  .put(function (req, res, next) {

    var aid = req.params.aid;
    var amId = req.params.amId;
    var isTest = req.body.test || false;
    var toEmail = req.user.email;
    var toName = req.user.name || toEmail;

    var to = [];
    to.push({
      name: toName,
      email: toEmail
    });

    automessage(aid, amId, to, function (err, responseStatus) {

      if (err) {

        if (err.message === 'Message not found') {
          return res.notFound(err.message);
        }

        return next(err);
      }

      res
        .status(200)
        .json({
          message: 'Message is queued'
        });


    });
  })


module.exports = router;
