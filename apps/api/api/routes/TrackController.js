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
var Notification = require('../models/Notification');
var User = require('../models/User');


/**
 * Lib
 */

var track = require('../lib/track');


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
 *
 * =======================
 * PSEUDOCODE
 * =======================
 * NOTES:
 *
 * - create a user cookie (dodatado.uid, 2 years) for an identified user
 * - create a session cookie (dodatado.sid, 30 minutes) for an user session
 * - create a company cookie (dodatado.cid, 2 years) for an user session
 * =======================
 * Input
 * =======================
 *
 *  app
 *  session
 *  user || user cookie
 *  company (optional)
 *  event
 *
 * =======================
 * Authenticate
 * =======================
 *
 * fetch app with apikey = dodatado id
 * check if url == request url
 * else return
 *
 *
 * =======================
 * Create Event
 * =======================
 *
 * if no user input or no session input
 *   return
 *
 * if no session id
 *   create session
 * else
 *   fetch session
 *   if not valid session (uid, aid)
 *     create new session
 *
 * create event
 *
 * send session id cookie
 *
 * =======================
 * Create Session
 * =======================
 *
 * if no user input
 *   return
 *
 * if company input
 *   fetch company
 *   if company does not exist
 *     create company
 *
 * fetch user
 * if no user
 *   create user
 *
 * create session
 *
 */

router
  .route('/')
  .get(function (req, res, next) {


    var data = req.query;
    var appKey = data.app_id;
    var user = data.user;
    var url = req.host;
    console.log('   /track', req.cookies);


    // fetch values from cookies
    var uid = req.cookies['dodatado.uid'];
    var sid = req.cookies['dodatado.sid'];
    var cid = req.cookies['dodatado.cid'];


    // Validations

    if (!appKey) {
      return res.badRequest('Please send app_id with the params');
    }


    // if both the user identifier and user cookie are not present, respond
    // with an error
    if (!(user || uid)) {
      return res.badRequest('Please send user_id or email to identify user');
    }

    user = JSON.parse(user);

    if (!(user.email || user.user_id)) {
      return res.badRequest('Please send user_id or email to identify user');
    }


    async.waterfall([

        function findAndVerifyApp(cb) {

          App
            .findByKey(appKey, function (err, app) {
              if (err) {
                return cb(err);
              }

              if (!app) {
                return cb(new Error('App Not Found'));
              }

              cb(null, app);

            });

        },

        function checkOrCreateCompany(cb) {

          // if valid cid, move on
          // else if no valid company object, move on
          // else getOrCreate company

          if (cid) {
            return cb();
          }

          if (!company) {
            return cb();
          }

          // TODO : getOrCreate company here
          cb();

        },


        function checkOrCreateUser(app, cb) {

          // if valid uid, move on
          // else getOrCreate user

          if (uid) {
            return cb(null, uid);
          }

          User.getOrCreate(app._id, user, function (err, usr) {
            cb(err, usr._id);
          });

        },


        function checkOrCreateSession(cb) {

          // if valid session id, move on
          // else create new session

          if (sid) {
            return cb();
          }

          // TODO create new session
          cb();
        },


        function createEvent(arguments) {

        }


      ],

      function (err, results) {

        if (err) return next(err);

        var resObj = {
          uid: 'user_id',
          cid: 'company_id',
          sid: 'session_id'
        };

        res.jsonp(resObj);

      });

  });



/**
 * GET /track/notifications
 *
 * @param {string} id user-id or email
 *
 * Returns the most recent queued auto notification for the user
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
    var appKey = data.app_id;

    // Validations
    if (!appKey) {
      return res.badRequest('Please send app_id with the params');
    }


    // user identifiers
    var email = data.email;
    var user_id = data.user_id;

    // if user identifier is not present, respond with an error
    if (!email && !user_id) {
      return res.badRequest('Please send user_id or email to identify user');
    }


    async.waterfall([


        function getApp(cb) {
          App.findByKey(appKey, cb);
        },


        function getOrCreateUser(app, cb) {

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


        function getNotification(user, cb) {

          var conditions = {
            uid: user._id
          };

          // get the latest notification
          var options = {
            sort: {
              ct: -1
            }
          };

          Notification.findOneAndRemove(conditions, options, cb);

        }


      ],


      function callback(err, notification) {

        if (err) return next(err);

        res
          .status(200)
          .json(notification);

      });


  });



/**
 * POST /track/conversations
 *
 * Creates a new conversation
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
    var appKey = data.app_id;
    var body = data.body;

    // if the message is a reply to a conversation, then it should have the
    // the amId
    var amId = data.amId;

    // user identifiers
    var email = data.email;
    var user_id = data.user_id;


    // Validations
    if (!appKey) {
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


    async.waterfall([


        function getApp(cb) {
          App.findByKey(appKey, cb);
        },


        function getOrCreateUser(app, cb) {

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

          var newConversation = {
            aid: user.aid,
            messages: [],
            sub: 'Message from ' + user.email,
            uid: user._id
          };

          var msg = {
            body: body,

            // add from as 'user'
            from: 'user',

            type: 'email',

            // add sender name 'sName' as user's name or email
            // TODO: Check is user.name will work
            sName: user.name || user.email

          };

          newConversation.messages.push(msg);

          Conversation.create(newConversation, cb);
        }

      ],


      function callback(err, conversation) {

        if (err) return next(err);

        res
          .status(201)
          .json(conversation);

      });


  });



/**
 * Expose router
 */

module.exports = router;
