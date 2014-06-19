/**
 * npm dependencies
 */

var _ = require('lodash');
var async = require('async');
var ObjectId = require('mongoose')
  .Types.ObjectId;
var router = require('express')
  .Router();


/**
 * Helpers
 */

var appEmail = require('../../helpers/app-email');
var logger = require('../../helpers/logger');


/**
 * Models
 */

var Account = require('../models/Account');
var App = require('../models/App');
var Event = require('../models/Event');
var Conversation = require('../models/Conversation');
var User = require('../models/User');


function mailgunCallback(req, res, next) {

  return function (err) {

    if (err) {
      logger.crit({
        at: 'Mailgun Output',
        err: err
      });

      return next(err);

    } else {

      logger.trace({
        at: 'Mailgun Output',
        body: req.body
      });
      
      res.json();
    }

  }

};



router
  .route('/new/apps/:aid')
  .post(function (req, res, next) {

    logger.trace({
      at: 'MailgunController new',
      // body: req.body['stripped-text'],
      param: req.params
    })

    var aid = req.params.aid;

    // REF: http://documentation.mailgun.com/user_manual.html#routes
    var body = req.body['stripped-text'];

    var ct = req.body.timestamp * 1000;
    var sender = req.body.sender;
    var subject = req.body.subject;

    var user = {
      email: sender
    };

    var callback = mailgunCallback(req, res, next);

    async.waterfall(

      [

        function getOrCreateUser(cb) {
          User.findOrCreate(aid, user, cb);
        },


        function createConversation(user, cb) {

          var newConv = {
            aid: aid,
            ct: ct,
            messages: [

              {

                // TODO: remove previous messages from body before saving
                // body: removeQuotedText(toEmail, message.msg.body),
                body: body,
                ct: ct,
                from: 'user',
                sent: true,
                sName: user.name || user.email,
                type: 'email',

              }

            ],
            sub: subject,
            toRead: true,
            uid: user._id
          };

          Conversation.create(newConv, cb);
        }

      ],

      callback);

  });



router
  .route('/reply/apps/:aid/conversations/:identifier')
  .post(function (req, res, next) {

    logger.trace({
      at: 'MailgunController reply',
      // body: req.body['stripped-text'],
      param: req.params
    })

    var parsedId = appEmail.parseIdentifier(req.params.identifier);
    var type = parsedId.type;
    var messageId = parsedId.messageId;

    var aid = req.params.aid;

    // REF: http://documentation.mailgun.com/user_manual.html#routes
    var body = req.body['stripped-text'];

    var ct = req.body.timestamp * 1000;
    var sender = req.body.sender;
    var subject = req.body.subject;

    var callback = mailgunCallback(req, res, next);


    if (type === 'manual') {

      // if manual message, create new reply

      async.waterfall(

        [

          function getOrCreateUser(cb) {
            var user = {
              email: sender
            };

            User.findOrCreate(aid, user, cb)
          },


          function saveReply(user, cb) {

            var reply = {

              body: body,
              ct: ct,
              from: 'user',
              sent: true,
              sName: user.name || user.email,
              type: 'email'

            };

            Conversation.reply(aid, messageId, reply, cb);
          }


        ], callback);



    } else if (type === 'auto') {

      // if automessage, create new conversation

      async.waterfall(

        [

          function getOrCreateUser(cb) {
            var user = {
              email: sender
            };

            User.findOrCreate(aid, user, cb);
          },


          function createConversation(user, cb) {

            var newConv = {
              aid: aid,
              amId: messageId,
              ct: ct,
              messages: [

                {

                  // TODO: remove previous messages from body before saving
                  // body: removeQuotedText(toEmail, message.msg.body),
                  body: body,
                  ct: ct,
                  from: 'user',
                  sent: true,
                  type: 'email',

                }

              ],
              sub: subject,
              toRead: true,
              uid: user._id
            };

            Conversation.create(newConv, cb);
          }

        ],

        callback);


    } else {

      callback(new Error('neither manual not automessage'));
    }

  });


router
  .route('/opens')
  .post(function (req, res, next) {

    var messageId = req.body.uj_mid;
    var type = req.body.uj_type;
    var aid = req.body.uj_aid;
    var uid = req.body.uj_uid;
    var title = req.body.uj_title;

    var cb = mailgunCallback(req, res, next);

    if (type === 'auto') {

      var ids = {
        aid: aid,
        uid: uid,
        amId: messageId
      }

      Event.automessage(ids, 'opened', title, cb)

    } else if (type === 'manual') {

      Conversation.opened(messageId, cb);

    } else {
      // tracking must have been disabled
      // do nothing

      cb(new Error('neither manual not auto'));
    }

  });


router
  .route('/clicks')
  .post(function (req, res, next) {

    var messageId = req.body.uj_mid;
    var type = req.body.uj_type;
    var aid = req.body.uj_aid;
    var uid = req.body.uj_uid;
    var title = req.body.uj_title;

    var cb = mailgunCallback(req, res, next);

    if (type === 'auto') {

      var ids = {
        aid: aid,
        uid: uid,
        amId: messageId
      }

      Event.automessage(ids, 'clicked', title, cb)

    } else if (type === 'manual') {

      Conversation.clicked(messageId, cb);

    } else {
      // tracking must have been disabled
      // do nothing

      cb(new Error('neither manual not auto'));
    }

  });


router
  .route('/delivers')
  .post(function (req, res, next) {

    var messageId = req.body.uj_mid;
    var type = req.body.uj_type;
    var aid = req.body.uj_aid;
    var uid = req.body.uj_uid;
    var title = req.body.uj_title;

    var cb = mailgunCallback(req, res, next);

    if (type === 'auto') {

      var ids = {
        aid: aid,
        uid: uid,
        amId: messageId
      }

      Event.automessage(ids, 'sent', title, cb)

    } else if (type === 'manual') {

      Conversation.sent(messageId, cb);

    } else {
      // tracking must have been disabled
      // do nothing

      cb(new Error('neither manual not auto'));
    }
  });



module.exports = router;
