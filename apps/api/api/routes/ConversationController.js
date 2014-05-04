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
var logger = require('../../helpers/logger');


/**
 * e.g. '532d6bf862d673ba7131812e+535d131c67d02dc60b2b1764@mail.userjoy.co'
 */

function replyToEmail(fromEmail, conversationId) {
  var emailSplit = fromEmail.split('@');
  var emailLocal = emailSplit[0];
  var emailDomain = emailSplit[1];
  var email = emailLocal + '+' + conversationId + '@' + emailDomain;
  return email;
}


/**
 * if name is 'Prateek',
 * replyTo name is 'Reply to Prateek'
 *
 * @param {string} fromName name of the sender
 * @return {string} reply-to name
 */

function replyToName(fromName) {
  var prepend = 'Reply to';
  var name = prepend + ' ' + fromName;
  return name;
}


/**
 * This sends email from an app admin to one of its users
 *
 * @param {object} msg the message object
 * @param {function} cb callback
 */

function sendMailToUser(msg, cb) {

  User
    .findById(msg.uid)
    .exec(function (err, usr) {

      if (err) return cb(err);
      if (!usr) return cb(new Error('User Not Found'));

      var fromEmail = appEmail(msg.aid);
      var locals = {
        fromEmail: fromEmail,
        fromName: msg.sName,
        metadata: {
          'mId': msg._id
        },
        replyToEmail: replyToEmail(fromEmail, msg.coId),
        replyToName: replyToName(msg.sName),
        subject: msg.sub,
        toEmail: usr.email,
        toName: usr.name, // TODO : User Model should have a default name key
        text: msg.text
      };
      mailer.sendToUser(locals, cb);
    });
}


// /**
//  * Add a delimiter on top of the function
//  * Used to extract out the text of the current message
//  */

// function addDelimiter(text) {
//   var delimiter = '## Please reply above to send message ##';
//   return delimiter
// }


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
    var filter = req.query.filter;

    var condition = {
      aid: aid,
      closed: false
    };

    if (filter === 'closed') {
      condition.closed = true;
    }

    logger.debug({
      at: 'GET /conversations',
      condition: condition,
      filter: filter
    });

    Conversation
      .find(condition)
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

        function areOpened(con, messages, cb) {
          var mIds = _.pluck(messages, '_id');

          // update seen status to true for all messages sent from user, which
          // belong to this thread
          Message.openedByTeamMember(mIds, function (err) {
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

    var newMessage = req.body;
    var accid = req.user._id;
    var aid = req.app._id;
    var sub = newMessage.sub;
    var uid = newMessage.uid;
    var fromEmail = appEmail(aid);

    // since this is a multi-query request (transaction), we need to make all
    // input validations upfront
    // uid, subject, text, type
    if (!(uid && aid && sub && newMessage.text && newMessage.type)) {
      return res.badRequest('Missing uid/sub/text/type');
    }

    async.waterfall(
      [

        // create new conversation
        function (cb) {

          var newConversation = {
            accId: accid,
            aid: aid,
            sub: sub,
            uid: uid
          };

          Conversation.create(newConversation, cb);
        },


        // create new message
        function (conversation, cb) {

          // add from as 'account'
          newMessage.from = 'account';
          newMessage.accid = accid;
          newMessage.aid = aid;
          newMessage.coId = conversation._id;

          Message.create(newMessage, cb);

        },

        // send message through mandrill
        function (msg, cb) {
          sendMailToUser(msg, function (err) {
            cb(err, msg);
          });
        }

      ],

      function (err, msg) {

        if (err) return next(err);
        res.json(msg, 201);
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
    // text
    if (!(reply.text)) {
      return res.badRequest('Missing text');
    }

    async.waterfall(
      [

        function findConversation(cb) {
          Conversation
            .findById(coId)
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
          reply.uid = conv.uid;

          // reply type is always email
          reply.type = 'email';

          Message.create(reply, cb);

        },

        function sendEmail(msg, cb) {
          sendMailToUser(msg, function (err) {
            cb(err, msg);
          });
        }

      ],

      function (err, msg) {

        logger.trace('ConversationController Reply', {
          err: !! err,
          msg: !! msg
        });

        if (err) return next(err);
        res.json(msg, 201);
      }
    );

  });


module.exports = router;
