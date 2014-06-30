/**
 * NPM dependencies
 */

var _ = require('lodash');
var async = require('async');
var cors = require('cors');
var geoip = require('geoip-lite');
var router = require('express')
  .Router();


/**
 * Models
 */

var Account = require('../models/Account');
var App = require('../models/App');
var Company = require('../models/Company');
var Conversation = require('../models/Conversation');
var Event = require('../models/Event');
var Notification = require('../models/Notification');
var User = require('../models/User');


/**
 * Helpers
 */

var logger = require('../../helpers/logger');
var nocache = require('../../helpers/no-cache-headers');


/**
 * Services
 */

var accountMailer = require('../services/account-mailer');


/**
 * Add CORS support for all /track routes
 */

router.use(cors());


/**
 * Disable caching of all requests to /track
 */

router.use(nocache);


/**
 * GET /track
 *
 * Tracks a 'form'/'link'/'page'/'track' event
 *
 * @query {string} app_id
 * @query {string} u user-id
 * @query {string} c company-id (optional)
 * @query {object} e event
 *        @property {string} type form / link / page / track
 *        @property {string} name (required for track type)
 *        @property {string} path (required for page type)
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

      // update user last seen timestamp
      User.updateLastSeen(event.uid);

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

    if (event.type === 'page') {

      // FIXME : pageview events must accept module name and meta data

      var name = event.name;
      return Event.page(ids, name, callback);

    } else if (_.contains(['form', 'link', 'track'], event.type)) {

      var name = event.name;
      var module = event.module;
      var meta = event.meta;
      var type = event.type;

      return Event.track(type, ids, name, module, meta, callback);

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


    if (user) {

      // user's ip should be the first element in req.ips object (TODO: check this)
      var clientIP = req.ips[0];

      if (clientIP) {
        user.ip = clientIP;

        // get location info from ip
        var loc = geoip.lookup(user.ip);
        if (_.isObject(loc) && loc.country) user.country = loc.country;
      }

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
 * GET /track/company
 *
 * Identifies a company
 *
 *
 * @query {string} app_id
 * @query {object} company
 *        @property company_id
 *        @property name (optional)
 *        @property other company properties (see company model)
 * @return {object}
 *         @property aid app-id
 *         @property uid company-id
 */

router
  .route('/company')
  .get(function (req, res, next) {


    logger.trace({
      at: 'TrackController:company',
      query: req.query
    });


    var data = req.query;
    var aid = data.app_id;
    var uid = data.u;
    var company = data.company;

    // Validations: Start ////////////////////

    if (!aid) {
      return res.badRequest('Please send app_id with the params');
    }

    // to add the user to the company
    if (!uid) {
      return res.badRequest('Please send uid with the params');
    }

    // Validations: End ////////////////////


    async.waterfall(

      [

        function findOrCreateCompany(cb) {

          Company.findOrCreate(aid, company, function (err, com) {
            cb(err, com);
          });

        },


        function findAndAddCompanyToUser(com, cb) {

          User.findById(uid, function (err, usr) {

            if (err) return next(err);
            if (!usr) return cb(new Error('USER_NOT_FOUND'));

            usr.addCompany(com._id, com.name, function (err, usr) {
              cb(err, com);
            });

          });

        }

      ],

      function (err, com) {

        if (err) {

          if (err.message === 'NO_COMPANY_ID') {

            return res.badRequest(
              'Please send company_id to identify company');

          } else if (err.message === 'USER_NOT_FOUND') {

            return res.badRequest(
              'Please send valid uid');

          } else if (err.message === 'INVALID_COMPANY_NAME') {

            return res.badRequest(
              'Please send company name');

          } else if (err.message === 'USER_ALREADY_BELONGS_TO_COMPANY') {

            // do nothing
            // sending success response

          } else {

            return next(err);
          }

        }

        var obj = {
          aid: com.aid,
          cid: com._id
        };

        res
          .status(200)
          .json(obj);
      }

    )

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
      return res.badRequest(
        'Please send user_id or email to identify user');
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
            cb(err, notf, user, app);
          });

        },


        function createAutoMessageOpenedEvent(notf, user, app, cb) {

          if (!notf) return cb(null, notf, app);

          var ids = {
            aid: app._id,
            amId: notf.amId,
            uid: user._id
          };

          var state = 'opened';
          var title = notf.title;

          Event.automessage(ids, state, title, function (err) {
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
      return res.badRequest(
        'Please send user_id or email to identify user');
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

          User.findOne(conditions, function (err, user) {
            cb(err, app, user);
          });
        },


        function createConversation(app, user, cb) {

          if (!user) return cb(new Error('USER_NOT_FOUND'));

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

          Conversation.create(newCon, function (err, con) {
            cb(err, app, con);
          });
        },

        function getAdmin(app, con, cb) {

          var admin = _.find(app.team, function (t) {
            return t.admin === true;
          });

          if (!_.isObject(admin)) return cb(new Error('ADMIN_NOT_FOUND'));

          Account
            .findById(admin.accid)
            .select({
              _id: -1,
              name: 1,
              email: 1
            })
            .lean()
            .exec(function (err, acc) {
              if (err) return cb(err);
              if (!acc) return cb(new Error('ADMIN_NOT_FOUND'));

              cb(null, acc, con);
            });

        },

        function sendMail(acc, con, cb) {

          /**
           * require config for dashboard url
           */
          var config = require('../../../config')('api');
          var dashboardUrl = config.hosts['dashboard'];
          var conversationUrl = dashboardUrl + '/apps/' + con.aid +
            '/messages/conversations/' + con._id;


          var opts = {
            locals: {
              conversationUrl: conversationUrl,
              message: con.messages[0].body,
              name: acc.name,
              sentBy: email,
              subject: con.sub
            },
            to: {
              name: acc.name,
              email: acc.email
            }
          };

          accountMailer.sendAdminConversation(opts, function (err) {
            cb(err, con);
          });
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

          if (err.message === 'USER_NOT_FOUND') {
            return res.badRequest('User not found');
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
