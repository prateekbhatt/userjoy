/**
 * npm dependencies
 */

var async = require('async');
var router = require('express')
  .Router();


/**
 * Models
 */

var Message = require('../models/Message');


/**
 * Policies
 */

var hasAccess = require('../policies/hasAccess');
var isAuthenticated = require('../policies/isAuthenticated');


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
 * GET /apps/:aid/messages
 *
 * Returns all messages for app
 */

router
  .route('/:aid/messages')
  .get(function (req, res, next) {

    var aid = req.app._id;

    Message
      .fetchInbox(aid, function (err, messages) {

        if (err) {
          return next(err);
        }

        res.json(messages || []);

      });

  });


// /**
//  * POST /apps/:aid/messages
//  *
//  * Creates and sends a new message
//  */

router
  .route('/')
  .post(function (req, res, next) {

    var newMessage = req.body;


    // add admin to newMessage
    newMessage.admin = req.user._id;


    Message
      .create(newMessage, function (err, app) {

        if (err) {
          return next(err);
        }

        res.json(app, 201);
      });

  });


/**
 * GET /apps/:aid/messages/unseen
 *
 * Returns all unseen messages
 */

router
  .route('/:aid/messages/unseen')
  .get(function (req, res, next) {

    var aid = req.app._id;

    Message
      .fetchUnseen(aid, function (err, messages) {

        if (err) {
          return next(err);
        }

        res.json(messages || []);

      });

  });


// /**
//  * GET /apps/:aid/messages/:id
//  *
//  * Returns conversation thread
//  */

// router
//   .route('/all')
//   .get(function (req, res, next) {
//     res.json(req.app);
//   });


module.exports = router;
