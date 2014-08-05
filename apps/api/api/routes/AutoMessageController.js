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
var Conversation = require('../models/Conversation');
var User = require('../models/User');


/**
 * Policies
 */

var hasAccess = require('../policies/hasAccess');
var isAuthenticated = require('../policies/isAuthenticated');


/**
 * Helpers
 */

var appEmail = require('../../helpers/app-email');
var logger = require('../../helpers/logger');


/**
 * Services
 */

var automessage = require('../services/automessage');


/**
 * Worker queue
 */

var amQueue = require('../../workers/queues')
  .automessage;


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
      .populate({
        path: 'sid',
        select: 'name'
      })
      .exec(function (err, automessages) {
        if (err) return next(err);
        res
          .status(200)
          .json(automessages);
      });

  });


/**
 * GET /apps/:aid/automessages/attributes
 *
 * NOTE:
 * 1. This route must be defined before /apps/:aid/automessages/:amId
 * 2. TODO: dynamically generate list based on custom attributes passed on by
 * users. Add 'app' and 'author' attributes as well
 *
 * Provides attributes for automessages
 */

router
  .route('/:aid/automessages/attributes')
  .get(function (req, res, next) {

    logger.trace('Fetching automessage attributes');

    var userAttributes = ['user.name', 'user.first_name', 'user.last_name',
      'user.email', 'user.plan'
    ];

    res
      .status(200)
      .json({
        userAttributes: userAttributes
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
      .populate({
        path: 'sender',
        select: 'name email'
      })
      .populate({
        path: 'sid',
        select: 'name'
      })
      .exec(function (err, automsg) {
        if (err) return next(err);
        res
          .status(200)
          .json({
            automessage: automsg
          });
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
    var aid = req.params.aid;
    var sender = req.body.sender;

    newAutoMessage.aid = aid;
    newAutoMessage.creator = accid;

    // if sender account id is not provided, add logged in account as sender
    newAutoMessage.sender = sender || accid;

    // if type notification, make title as subject
    // TODO: test this case
    if (newAutoMessage.type === 'notification') {
      newAutoMessage.sub = newAutoMessage.title;
    }

    AutoMessage
      .create(newAutoMessage, function (err, savedAutoMsg) {
        if (err) return next(err);
        res
          .status(201)
          .json({
            automessage: savedAutoMsg
          });
      });

  });


/**
 * PUT /apps/:aid/automessages/:amId/send-test
 *
 * Sends a test automessage
 */

router
  .route('/:aid/automessages/:amId/send-test')
  .put(function (req, res, next) {

    var aid = req.params.aid;
    var amId = req.params.amId;


    async.waterfall(

      [

        function findAutoMessage(cb) {
          AutoMessage
            .findOne({
              aid: aid,
              _id: amId
            })
            .populate('sender')
            .exec(function (err, amsg) {
              if (err) return cb(err);
              if (!amsg) return cb(new Error('AutoMessage not found'));
              cb(null, amsg);
            });
        },


        // get or create an user for the admin in its own app
        function getOrCreateUser(amsg, cb) {
          var user = {
            email: amsg.sender.email
          };

          User.findOrCreate(req.app._id, user, function (err, usr) {
            cb(err, amsg, usr);
          });
        },


        function createConversationAndSend(amsg, user, cb) {
          automessage(req.app, amsg, amsg.sender, user, cb);
        }
      ],


      function callback(err) {

        if (err) {

          if (err.message === 'AutoMessage not found') {
            return res.notFound(err.message);
          }

          return next(err);
        }

        res
          .status(200)
          .json({
            message: 'Message is queued'
          });


      })
  })


/**
 * PUT /apps/:aid/automessages/:amId/active/:status
 *
 * status should be either true or false
 *
 * Updates active status of automessage.
 * If automessage got activated, then queue it now
 */

router
  .route('/:aid/automessages/:amId/active/:status?')
  .put(function (req, res, next) {


    logger.trace({
      at: 'automessage:updateStatus',
      params: req.params
    });


    var aid = req.params.aid;
    var amId = req.params.amId;
    var status = req.params.status;

    if (!_.contains(['true', 'false'], status)) {
      return res.badRequest(
        'Active status should be either true or false');
    }


    async.waterfall(
      [

        function findAutoMessage(cb) {
          AutoMessage.findOne({
            _id: amId,
            aid: aid
          }, function (err, amsg) {
            if (err) return cb(err);
            if (!amsg) return cb(new Error('AutoMessage not found'));
            cb(null, amsg);
          });
        },

        function updateActiveStatus(amsg, cb) {
          amsg.active = status;
          amsg.save(function (err, savedAmsg) {
            cb(err, savedAmsg);
          });
        },

        function queueActivatedAutomessage(amsg, cb) {

          // if automessage deactivated, move on
          if (status === 'false') return cb(null, amsg, null);

          // if automessage just got activated, queue it
          var ids = [amsg._id.toString()];
          amQueue()
            .post(ids, function (err, queueId) {
              cb(err, amsg, queueId);
            });

        },

        function updateLastQueuedTimestamp(amsg, queueId, cb) {

          // if automessage deactivated, move on
          if (status === 'false') return cb(null, amsg, null);

          amsg.lastQueued = Date.now();
          amsg.save(function (err, savedAmsg) {
            cb(err, savedAmsg, queueId);
          })
        }
      ],

      function (err, amsg, queueId) {
        if (err) {
          if (err.message === 'AutoMessage not found') {
            return res.notFound(err.message);
          }
          return next(err);
        }

        res
          .status(200)
          .json({
            automessage: amsg,
            queueId: queueId
          });
      }
    );

  });


/**
 * PUT /apps/:aid/automessages/:amId
 *
 * Updates body, sub and title of auto message
 */

router
  .route('/:aid/automessages/:amId')
  .put(function (req, res, next) {

    logger.trace('Updating automessage');

    var amId = req.params.amId;
    var body = req.body.body;
    var sub = req.body.sub;
    var title = req.body.title;

    AutoMessage
      .findById(amId, function (err, amsg) {
        if (err) return next(err);


        // if body / sub / title have been provided for update
        if (body) amsg.body = body;
        if (sub) amsg.sub = sub;
        if (title) amsg.title = title;

        amsg.save(function (err, savedAmsg) {
          if (err) return next(err);

          res
            .status(201)
            .json({
              automessage: savedAmsg
            });
        })

      });

  });


module.exports = router;
