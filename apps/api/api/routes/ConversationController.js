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

var Conversation = require('../models/Conversation');
var Message = require('../models/Message');
var User = require('../models/User');


/**
 * Policies
 */

var hasAccess = require('../policies/hasAccess');
var isAuthenticated = require('../policies/isAuthenticated');


/**
 * Services
 */

var mailer = require('../services/mailer');


/**
 * Helpers
 */

var appEmail = require('../../helpers/app-email');
var getMailerLocals = require('../../helpers/get-mailer-locals');
var logger = require('../../helpers/logger');
var render = require('../../helpers/render-message');


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
 * PUT /apps/:aid/conversations/:coId/closed
 *
 * Closes the conversation
 */

router
  .route('/:aid/conversations/:coId/closed')
  .put(function (req, res, next) {

    var aid = req.params.aid;
    var coId = req.params.coId;

    if (!(aid && coId)) {
      return res.badRequest('Provide valid aid/coId');
    }


    // TODO: also take the aid as an input param as an additional check
    Conversation.closed(coId, function (err, msg) {
      if (err) return next(err);

      res
        .status(200)
        .json(msg);
    });

  });


/**
 * PUT /apps/:aid/conversations/:coId/reopened
 *
 * Reopens closed conversation
 */

router
  .route('/:aid/conversations/:coId/reopened')
  .put(function (req, res, next) {

    var aid = req.params.aid;
    var coId = req.params.coId;

    if (!(aid && coId)) {
      return res.badRequest('Provide valid aid/coId');
    }


    // TODO: also take the aid as an input param as an additional check
    Conversation.reopened(coId, function (err, msg) {
      if (err) return next(err);

      res
        .status(200)
        .json(msg);
    });

  });


/**
 * GET /apps/:aid/conversations
 *
 * @query {string} filter  open/closed (optional)
 *
 * Returns all open conversations for app
 */

router
  .route('/:aid/conversations')
  .get(function (req, res, next) {

    var aid = req.app._id;
    var filter = req.query.filter || 'open';

    var condition = {
      aid: aid
    };

    switch (filter) {

    case 'open':
      condition.closed = false;
      break;

    case 'closed':
      condition.closed = true;
      break;

    case 'unread':
      condition.toRead = true;
      break;

    default:
      // show open conversations by default
      condition.closed = false;
    }

    logger.debug({
      at: 'GET /conversations',
      condition: condition,
      filter: filter
    });

    Conversation
      .find(condition)
      .populate('assignee', 'name email')
      .sort({
        ct: -1
      })
      .exec(function (err, conversations) {
        if (err) return next(err);
        res.json(conversations || []);
      });

  });


/**
 * GET /apps/:aid/conversations/:coId
 *
 * Returns a conversation alongwith all messages
 */

router
  .route('/:aid/conversations/:coId')
  .get(function (req, res, next) {

    var aid = req.app._id;
    var coId = req.params.coId;

    async.waterfall(
      [

        function findConversation(cb) {
          Conversation
            .findById(coId)
            .populate('assignee', 'name email')
            .exec(cb);
        },

        function findMessages(con, cb) {
          Message
            .find({
              coId: coId
            })
            .sort({
              ct: 1
            })
            .exec(function (err, messages) {
              cb(err, con, messages)
            });
        },

        function messagesAreOpened(con, messages, cb) {
          var mIds = _.pluck(messages, '_id');

          // update seen status to true for all messages sent from user, which
          // belong to this thread
          Message.openedByTeamMember(mIds, function (err) {
            cb(err, con, messages);
          });
        },

        function conversationIsRead(con, messages, cb) {
          Conversation.isRead(con._id, function (err) {
            cb(err, con, messages);
          });
        }

      ],

      function (err, con, messages) {

        if (err) return next(err);

        con = con.toJSON();
        con.messages = messages;

        res.json(con);
      }

    );

  });


/**
 * POST /apps/:aid/conversations
 *
 * Creates a new conversation, a new message and sends message to user
 */

router
  .route('/:aid/conversations')
  .post(function (req, res, next) {

    var newMsg = req.body;
    var assignee = req.user._id;
    var aid = req.app._id;
    var sub = newMsg.sub;
    var uids = newMsg.uids;
    var fromEmail = appEmail(aid);

    // since this is a multi-query request (transaction), we need to make all
    // input validations upfront
    // uids, body, subject, type
    if (!(uids && aid && sub && newMsg.body && newMsg.type)) {
      return res.badRequest('Missing body/sub/type/uids');
    }


    if (!_.isArray(uids) || _.isEmpty(uids)) {
      return res.badRequest('Provide atleast on user id in the uids array');
    };


    async.waterfall(
      [


        function findUsers(cb) {

          User
            .find({
              _id: {
                $in: uids
              }
            })
            .select({
              name: 1,
              email: 1
            })
            .exec(cb);
        },


        function createMessages(users, cb) {

          var iterator = function (user, iteratorCB) {

            async.waterfall(

              [

                function createConversation(cb) {
                  var newConversation = {
                    aid: aid,
                    assignee: assignee,
                    sub: sub,
                    uid: user._id
                  };

                  Conversation.create(newConversation, cb);
                },


                function createMessage(conversation, cb) {

                  newMsg.accid = assignee;
                  newMsg.aid = aid;
                  newMsg.coId = conversation._id;

                  // add from as 'account'
                  newMsg.from = 'account';

                  // add sender name 'sName' as account name
                  newMsg.sName = req.user.name || req.user.email;

                  newMsg.uid = user._id;

                  // locals to be passed for rendering the templates
                  var locals = {
                    user: user
                  };

                  // render body and subject
                  newMsg.body = render.string(newMsg.body, locals);
                  newMsg.sub = render.string(newMsg.sub, locals);

                  Message.create(newMsg, function (err, msg) {

                    if (err) return cb(err);

                    msg = msg.toJSON();

                    // NOTE: adding the toEmail and toNames to messages to make
                    // it simpler while mailing them

                    msg.toEmail = user.email;
                    msg.toName = user.name;
                    cb(null, msg);
                  });

                }
              ],

              iteratorCB

            );

          };

          async.map(users, iterator, cb);
        },


        function sendMessages(messages, cb) {

          // TODO: check if message is notification or email

          if (newMsg.type !== "email") return cb(err, messages);

          var iterator = function (msg, cb) {
            var toEmail = msg.toEmail;
            var toName = msg.toName;
            var locals = getMailerLocals('manual', msg, toName, toEmail);
            mailer.sendManualMessage(locals, function (err) {
              cb(err, msg);
            });
          };

          async.map(messages, iterator, cb);

        }

      ],

      function callback(err, msgs) {

        if (err) return next(err);
        res
          .status(201)
          .json(msgs);
      }
    );

  });


/**
 * POST /apps/:aid/conversations/:coId
 *
 * Creates and sends a reply message to a conversation
 */

router
  .route('/:aid/conversations/:coId')
  .post(function (req, res, next) {

    var reply = req.body;
    var accid = req.user._id;
    var aid = req.app._id;
    var coId = req.params.coId;

    // sName should be the name of the loggedin account or its primary email
    var sName = req.user.name || req.user.email;

    // since this is a multi-query request (transaction), we need to make all
    // input validations upfront
    // body
    if (!(reply.body)) {
      return res.badRequest('Missing body');
    }

    async.waterfall(
      [

        function findConversation(cb) {
          Conversation
            .findById(coId)
            .populate('uid', 'name email')
            .exec(cb);
        },

        function createReplyMessage(conv, cb) {

          reply.accid = accid;
          reply.aid = aid;
          reply.coId = conv._id;

          // add from as 'account'
          reply.from = 'account';

          reply.sName = sName;

          reply.sub = conv.sub;

          // since uid has been populated in the findConversation query above,
          // we need to access the user's id from conv.uid._id
          reply.uid = conv.uid._id;

          // reply type is always email
          reply.type = 'email';

          Message.create(reply, function (err, savedMsg) {
            cb(err, conv, savedMsg);
          });

        },

        function sendEmail(conv, msg, cb) {

          var toEmail = conv.uid.email;
          var toName = conv.uid.name;
          var locals = getMailerLocals('manual', msg, toName, toEmail);
          mailer.sendManualMessage(locals, function (err) {
            cb(err, msg);
          });
        }

      ],

      function (err, msg) {

        logger.debug('ConversationController Reply', {
          err: !! err,
          msg: !! msg
        });

        if (err) return next(err);
        res
          .status(201)
          .json(msg);
      }
    );

  });


/**
 * PUT /apps/:aid/conversations/:coId/assign
 *
 * Assigns team member to conversation
 */

router
  .route('/:aid/conversations/:coId/assign')
  .put(function (req, res, next) {

    var assignee = req.body.assignee;
    var aid = req.params.aid;
    var coId = req.params.coId;

    if (!assignee) return res.badRequest(
      'Provide valid account id (assignee)')

    Conversation.assign(aid, coId, assignee, function (err, con) {

      if (err) return next(err);
      if (!con) return res.notFound('Conversation not found');


      var populate = {
        path: 'assignee',
        select: 'name email'
      };

      con.populate(populate, function (err, conversation) {
        if (err) return next(err);

        res
          .status(201)
          .json(conversation);
      })

    });
  });


module.exports = router;
