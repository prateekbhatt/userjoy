/**
 * NPM dependencies
 */

var _ = require('lodash');
var async = require('async');
var cors = require('cors');
var router = require('express')
  .Router();


/**
 * Models
 */

var App = require('../models/App');
var Conversation = require('../models/Conversation');
var Event = require('../models/Event');
var Notification = require('../models/Notification');
var User = require('../models/User');


/**
 * Helpers
 */

var logger = require('../../helpers/logger');


/**
 * Add CORS support for all /track routes
 */

router.use(cors());


/**
 * GET /track
 *
 * Tracks a 'pageview' or a 'feature' event
 *
 * @query {string} app_id
 * @query {string} u user-id
 * @query {string} c company-id (optional)
 * @query {object} e event
 *        @property {string} type pageview / feature
 *        @property {string} name (required for feature type)
 *        @property {string} path (required for pageview type)
 *        @property {string} other properties (see Event model)
 * @return {object}
 *         @property {string} aid app-id
 *         @property {string} eid event-id
 *         @property {string} uid user-id
 *         @property {string} cid company-id (only if company id provided)
 */

router
  .route('/')
  .get(function (req, res, next) {

    logger.trace({
      at: 'TrackController:track',
      query: req.query
    });


    var q = req.query;
    var aid = q.app_id;
    var uid = q.u;
    var cid = q.c;
    var event = q.e;

    // VALIDATIONS : START //////////////////

    if (!aid) {
      return res.badRequest('Please send app_id with the params');
    }

    if (!uid) {
      return res.badRequest('Please send uid with the params');
    }

    // VALIDATIONS : END //////////////////

    var callback = function (err, event) {

      if (err) {
        if (err.message === 'NO_EMAIL_OR_USER_ID') {
          return res.badRequest(
            'Please send user_id or email to identify user');
        }

        return next(err);
      }

      var obj = {
        eid: event._id,
        aid: event.aid,
        uid: event.uid,
        cid: event.cid
      };

      res
        .status(200)
        .json(obj);

    };

    var ids = {
      aid: aid,
      uid: uid
    };

    if (cid) ids.cid = cid;

    if (event.type === 'pageview') {

      var path = event.path;
      return Event.pageview(ids, path, callback);

    } else if (event.type === 'feature') {

      var name = event.name;
      var feature = event.feature;
      var meta = event.meta;

      return Event.feature(ids, name, feature, meta, callback);

    } else {

      return res.badRequest('Event type is not supported');

    }


  });


/**
 * GET /track/identify
 *
 * Identifies a user
 *
 *
 * @query {string} app_id
 * @query {object} user
 *        @property email
 *        @property user_id (optional)
 *        @property other user properties (see user model)
 * @return {object}
 *         @property aid app-id
 *         @property uid user-id
 */

router
  .route('/identify')
  .get(function (req, res, next) {


    logger.trace({
      at: 'TrackController:identify',
      query: req.query
    });


    var data = req.query;
    var aid = data.app_id;
    var user = data.user;

    // Validations
    if (!aid) {
      return res.badRequest('Please send app_id with the params');
    }

    User.findOrCreate(aid, user, function (err, usr) {

      if (err) {

        if (err.message === 'NO_EMAIL_OR_USER_ID') {
          return res.badRequest(
            'Please send user_id or email to identify user');
        }

        return next(err);
      }

      var obj = {
        aid: usr.aid,
        uid: usr._id
      };

      res
        .status(200)
        .json(obj);

    });

  });



/**
 * GET /track/notifications
 *
 * @param {string} id user-id or email
 *
 * 1. Returns the most recent queued auto notification for the user
 * 2. Also contains the theme color of the notification / message-box
 */

router
  .route('/notifications')
  .get(function (req, res, next) {


    logger.trace({
      at: 'TrackController:getNotification',
      query: req.query,
      cookies: req.cookies
    });


    var data = req.query;
    var aid = data.app_id;

    // user identifiers
    var email = data.email;
    var user_id = data.user_id;


    // VALIDATIONS

    // if aid is not present, there is no way to identify an app
    if (!aid) {
      return res.badRequest('Please send app_id with the params');
    }

    // if user identifier is not present, respond with an error
    if (!email && !user_id) {
      return res.badRequest('Please send user_id or email to identify user');
    }


    async.waterfall([


        function getApp(cb) {
          App.findById(aid, function (err, app) {

            if (err) {

              if (err.name === 'CastError') {
                return cb(new Error('INVALID_APP_KEY'));
              }

              return cb(err);
            }

            if (!app) return cb(new Error('APP_NOT_FOUND'));
            cb(null, app);
          });
        },


        function findUser(app, cb) {

          var conditions = {
            aid: app._id
          };

          if (user_id) {
            conditions.user_id = user_id;
          } else if (email) {
            conditions.email = email;
          } else {
            return cb(new Error('Please send user_id or email'));
          }

          User.findOne(conditions, function (err, user) {
            cb(err, user, app);
          });
        },


        function getNotification(user, app, cb) {

          var conditions = {
            uid: user._id
          };

          // get the latest notification
          var options = {
            sort: {
              ct: -1
            }
          };

          Notification.findOneAndRemove(conditions, options, function (err,
            notf) {
            cb(err, notf, app);
          });

        }


      ],


      function callback(err, notification, app) {

        if (err) {

          if (err.message === 'INVALID_APP_KEY') {
            return res.badRequest('Provide valid app id');
          }

          if (err.message === 'APP_NOT_FOUND') {
            return res.badRequest('Provide valid app id');
          }

          return next(err);
        }

        // pass the theme color alongwith the notification
        notification = notification ? notification.toJSON() : {};
        notification.color = app.color;


        res
          .status(200)
          .json(notification);

      });


  });



/**
 * POST /track/conversations
 *
 * Creates a new conversation
 *
 * If user is replying to a notification, then the amId must be there
 */

router
  .route('/conversations')
  .post(function (req, res, next) {

    logger.trace({
      at: 'TrackController:createConversation',
      body: req.body,
      cookies: req.cookies
    });

    var data = req.body;
    var aid = data.app_id;
    var body = data.body;

    // if the message is a reply to a conversation, then it should have the
    // the amId
    var amId = data.amId;

    // user identifiers
    var email = data.email;
    var user_id = data.user_id;


    // VALIDATIONS : START //////////////////

    if (!aid) {
      return res.badRequest('Please send app_id with the params');
    }

    // if user identifier is not present, respond with an error
    if (!email && !user_id) {
      return res.badRequest('Please send user_id or email to identify user');
    }

    // is message body is not present, send bad request error
    if (!body) {
      return res.badRequest('Please write a message');
    }

    // VALIDATIONS : END ////////////////////



    async.waterfall([


        function getApp(cb) {
          App.findById(aid, function (err, app) {
            if (err) {

              if (err.name === 'CastError') {
                return cb(new Error('INVALID_APP_KEY'));
              }

              return cb(err);
            }
            if (!app) return cb(new Error('APP_NOT_FOUND'));
            cb(null, app);
          });
        },


        function findUser(app, cb) {

          var conditions = {
            aid: app._id
          };

          if (user_id) {
            conditions.user_id = user_id;
          } else if (email) {
            conditions.email = email;
          } else {
            return cb(new Error('Please send user_id or email'));
          }

          User.findOne(conditions, cb);
        },


        function createConversation(user, cb) {

          var newCon = {
            aid: user.aid,
            messages: [],
            sub: 'Message from ' + user.email,
            uid: user._id
          };


          // if amId is present
          if (amId) newCon.amId = amId;


          var msg = {
            body: body,

            // add from as 'user'
            from: 'user',

            // type should be notification
            type: 'notification',

            // add sender name 'sName' as user's name or email
            // TODO: Check is user.name will work
            sName: user.name || user.email

          };

          newCon.messages.push(msg);

          Conversation.create(newCon, cb);
        }

      ],


      function callback(err, conversation) {

        if (err) {

          if (err.message === 'INVALID_APP_KEY') {
            return res.badRequest('Provide valid app id');
          }

          if (err.message === 'APP_NOT_FOUND') {
            return res.badRequest('Provide valid app id');
          }

          return next(err);
        }

        res
          .status(201)
          .json(conversation);

      });


  });



/**
 * Expose router
 */

module.exports = router;
