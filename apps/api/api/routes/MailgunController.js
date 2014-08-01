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
var AutoMessage = require('../models/AutoMessage');
var App = require('../models/App');
var Conversation = require('../models/Conversation');
var User = require('../models/User');


/**
 * Lib
 */

var createEventAndIncrementCount = require(
  '../lib/create-automessage-event-and-increment-count');


/**
 * Services
 */

var accountMailer = require('../services/account-mailer');


function mailgunCallback(req, res, next) {

  return function (err) {

    if (err) {
      logger.crit({
        at: 'Mailgun Output',
        status: 'error',
        err: err
      });

      return next(err);

    } else {

      logger.trace({
        at: 'Mailgun Output',
        status: 'success'
      });

      return res
        .status(200)
        .json();
    }

  };

}


/**
 * Sends email to admin of the app
 */

function sendEmail(userEmail, acc, con, cb) {

  /**
   * get dashboard url from config
   */
  var config = require('../../../config')('api');
  var dashboardUrl = config.hosts.dashboard;
  var conversationUrl = dashboardUrl + '/apps/' + con.aid +
    '/messages/conversations/' + con._id;


  var opts = {
    locals: {
      conversationUrl: conversationUrl,
      message: con.messages[con.messages.length - 1].body,
      name: acc.name,
      sentBy: userEmail,
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


/**
 * Get admin of app
 *
 * @param {string} aid app-id
 * @param {function} cb callback
 *     @param (string) err
 *     @param {object}
 *          @property {string} email admin-email
 *          @property {string} name admin-name
 */

function getAdmin(aid, cb) {

  async.waterfall(

    [

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


      function getAccount(app, cb) {

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

            cb(null, acc);
          });
      },
    ], cb)

}


/**
 * Get account of the assignee of the conversation
 * Used to send him an email
 *
 * @param {string} accid account-id
 * @param {function} cb callback
 */

function getAssigneeAccount(accid, cb) {
  Account
    .findById(accid)
    .select({
      _id: -1,
      name: 1,
      email: 1
    })
    .lean()
    .exec(cb);
}



// router
//   .route('/new/apps/:aid')
//   .post(function (req, res, next) {

//     logger.trace({
//       at: 'MailgunController new',
//       // body: req.body['stripped-text'],
//       param: req.params
//     });

//     var aid = req.params.aid;

//     // REF: http://documentation.mailgun.com/user_manual.html#routes
//     var body = req.body['stripped-text'];

//     var ct = req.body.timestamp * 1000;
//     var sender = req.body.sender;
//     var subject = req.body.subject;

//     var user = {
//       email: sender
//     };

//     var callback = mailgunCallback(req, res, next);

//     async.waterfall(

//       [

//         function getOrCreateUser(cb) {
//           User.findOrCreate(aid, user, function (err, usr) {
//             cb(err, usr);
//           });
//         },


//         function createConversation(user, cb) {

//           var newConv = {
//             aid: aid,
//             ct: ct,
//             messages: [

//               {

//                 body: body,
//                 ct: ct,
//                 from: 'user',
//                 sent: true,
//                 sName: user.name || user.email,
//                 type: 'email',

//               }

//             ],
//             sub: subject,
//             uid: user._id
//           };

//           Conversation.create(newConv, function (err, con) {
//             cb(err, con, user);
//           });
//         },

//         function getAdminAccount(con, user, cb) {
//           getAdmin(con.aid, function (err, acc) {
//             cb(err, acc, con, user);
//           });
//         },

//         function sendAdminConversation(acc, con, user, cb) {
//           sendEmail(user.email, acc, con, cb);
//         }


//       ],

//       callback);

//   });



router
  .route('/new/apps/:aid')
  .post(function (req, res, next) {

    logger.trace({
      at: 'MailgunController reply',
      // body: req.body['stripped-text'],
      param: req.params,
      body: req.body
    });


    // get unique message-ids set by mailgun/gmail/outlook ...
    // used for creating email threads
    var replyToEmailId = req.body['In-Reply-To'];
    var newMsgEmailId = req.body['Message-Id'];


    var aid = req.params.aid;

    // REF: http://documentation.mailgun.com/user_manual.html#routes
    var body = req.body['stripped-text'];

    var ct = req.body.timestamp * 1000;
    var sender = req.body.sender;
    var subject = req.body.subject;

    var callback = mailgunCallback(req, res, next);


console.log('\n\n\n\n THE EMAIL IDS', replyToEmailId, newMsgEmailId, '\n\n\n\n');


    if (replyToEmailId) {

      // IF ITS A REPLY THEN replyToEmailId MUST BE PRESENT

      async.waterfall(

        [

          function getOrCreateUser(cb) {
            var user = {
              email: sender
            };

            User.findOrCreate(aid, user, cb);
          },


          function saveReply(user, cb) {

            var reply = {

              body: body,
              ct: ct,

              // the unique message-id of the email
              emailId: newMsgEmailId,

              from: 'user',
              sent: true,
              sName: user.name || user.email,
              type: 'email'

            };

            Conversation.replyByEmailId(replyToEmailId, reply,
              function (err, con) {
                cb(err, user, con);
              });
          },

          function getAccount(user, con, cb) {
            getAssigneeAccount(con.assignee, function (err, acc) {
              if (err) return cb(err);
              if (!acc) return cb(new Error('ADMIN_NOT_FOUND'));

              cb(null, acc, user, con);
            });
          },

          function sendAdminConversation(acc, user, con, cb) {
            sendEmail(user.email, acc, con, cb);
          }


        ], callback);


    } else {

      // IF ITS A NEW EMAIL

      async.waterfall(

        [

          function getOrCreateUser(cb) {
            User.findOrCreate(aid, user, function (err, usr) {
              cb(err, usr);
            });
          },


          function createConversation(user, cb) {

            var newConv = {
              aid: aid,
              ct: ct,
              messages: [

                {

                  body: body,
                  ct: ct,
                  from: 'user',
                  sent: true,
                  sName: user.name || user.email,
                  type: 'email',

                }

              ],
              sub: subject,
              uid: user._id
            };

            Conversation.create(newConv, function (err, con) {
              cb(err, con, user);
            });
          },

          function getAdminAccount(con, user, cb) {
            getAdmin(con.aid, function (err, acc) {
              cb(err, acc, con, user);
            });
          },

          function sendAdminConversation(acc, con, user, cb) {
            sendEmail(user.email, acc, con, cb);
          }


        ],

        callback);


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
      };

      createEventAndIncrementCount(ids, 'seen', title, cb);

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
      };

      createEventAndIncrementCount(ids, 'clicked', title, cb);

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
      };

      createEventAndIncrementCount(ids, 'sent', title, cb);

    } else if (type === 'manual') {

      Conversation.sent(messageId, cb);

    } else {
      // tracking must have been disabled
      // do nothing

      cb(new Error('neither manual not auto'));
    }
  });



module.exports = router;
