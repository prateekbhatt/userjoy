/**
 * npm dependencies
 */

var _ = require('lodash');
var async = require('async');
// var gravatar = require('nodejs-gravatar');
var gravatar = require('node-gravatar');
var moment = require('moment');
var router = require('express')
  .Router();


/**
 * Models
 */

var Conversation = require('../models/Conversation');
var User = require('../models/User');


/**
 * Policies
 */

var hasAccess = require('../policies/hasAccess');
var isAuthenticated = require('../policies/isAuthenticated');


/**
 * Services
 */

var accountMailer = require('../services/account-mailer');
var userMailer = require('../services/user-mailer');


/**
 * Helpers
 */

var appEmail = require('../../helpers/app-email');
var logger = require('../../helpers/logger');
var render = require('../../helpers/render-message');


// /**
//  * Creates the Reply-To email to track conversation threads
//  *
//  * e.g. '532d6bf862d673ba7131812e+535d131c67d02dc60b2b1764@mail.userjoy.co'
//  */

// function replyToEmailManual(fromEmail, conversationId) {
//   var emailSplit = fromEmail.split('@');
//   var emailLocal = emailSplit[0];
//   var emailDomain = emailSplit[1];
//   var email = emailLocal + '+' + conversationId + '@' + emailDomain;
//   return email;
// }


// add templateDate property to each message in the conversation for
// showing well formatted time in the emails
function addTemplateDate(conv) {

  // convert conv obj to JSON if BSON
  conv = conv.toJSON ? conv.toJSON() : conv;

  _.each(conv.messages, function (m) {
    m.templateDate = moment(m.ct)
      .format('D MMM, h:m a');
  });

  return conv;
}


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
    var health = req.query.health || null;

    // match conversation by filter condition
    var convMatch = {
      aid: aid
    };




    // filter convMatch
    switch (filter) {

    case 'open':
      convMatch.closed = false;
      break;

    case 'closed':
      convMatch.closed = true;
      break;

    case 'unread':
      convMatch.toRead = true;
      break;

    default:
      // show open conversations by default
      convMatch.closed = false;
    }


    logger.debug({
      at: 'GET /conversations',
      convMatch: convMatch,
      filter: filter,
      health: health
    });


    async.waterfall(

      [

        function findConversations(cb) {

          Conversation
            .find(convMatch)
            .populate('assignee', 'name email')
            .populate('uid', 'email')
            .sort({
              ct: -1
            })
            .lean()
            .exec(cb);

        },


        // if health filter also there, then run the userMatch
        function filterByHealth(cons, cb) {

          // if no health filter, move on
          if (!health) return cb(null, cons);


          // find unique user ids from all conversations
          var uids = _.chain(cons)
            .map(function (c) {
              return c.uid._id;
            })
            .uniq()
            .value();


          User
            .find({
              _id: {
                $in: uids
              },
              aid: aid,
              health: health
            })
            .select('_id')
            .lean()
            .exec(function (err, usrs) {

              if (err) return cb(err);

              // pluck out the _id vals and convert them to strings
              var selectUids = _.chain(usrs)
                .pluck('_id')
                .map(function (id) {
                  return id.toString();
                })
                .value();

              var filteredCons = _.filter(cons, function (c) {
                return _.contains(selectUids, c.uid._id.toString());
              });

              cb(null, filteredCons);

            });

        }

      ],


      function callback(err, conversations) {
        if (err) return next(err);
        res
          .status(200)
          .json(conversations || []);
      }
    )



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
            .populate('uid', 'email')
            .populate('messages.accid', 'email')
            .exec(cb);
        },

        function messagesAreOpened(con, cb) {

          // update seen status to true for all messages sent from user, which
          // belong to this thread
          Conversation.openedByTeamMember(con._id, function (err) {
            cb(err, con);
          });
        },

        function conversationIsRead(con, cb) {
          Conversation.isRead(con._id, function (err) {
            cb(err, con);
          });
        }

      ],

      function (err, con) {

        if (err) return next(err);

        res
          .status(200)
          .json(con);
      }

    );

  });


/**
 * POST /apps/:aid/conversations
 *
 * NOTE: Only emails can be sent by manual messages now, notifications are not allowed
 *
 * Creates a new conversation, a new message and sends message to user
 */

router
  .route('/:aid/conversations')
  .post(function (req, res, next) {

    logger.trace({
      at: 'ConversationController:createConversation',
      params: req.params,
      body: req.body
    })

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
      // return res.badRequest('Missing body/sub/type/uids');
      return res.badRequest('Please write a body and a subject');
    }

    // NOTE: only emails can be sent through manual messages now
    if (newMsg.type !== 'email') {
      return res.badRequest(
        'Only emails can be sent through manual messages');
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

            // locals to be passed for rendering the templates
            var locals = {
              user: user
            };

            // render body and subject
            newMsg.body = render.string(newMsg.body, locals);
            sub = render.string(newMsg.sub, locals);


            var newConversation = {
              aid: aid,
              assignee: assignee,
              messages: [],
              sub: sub,
              uid: user._id
            };

            newMsg.accid = assignee;

            // add from as 'account'
            newMsg.from = 'account';

            // add sender name 'sName' as account name
            newMsg.sName = req.user.name || req.user.email;


            newConversation.messages.push(newMsg);

            Conversation.create(newConversation, function (err, con) {

              if (err) return cb(err);

              con = con.toJSON();

              // NOTE: adding the toEmail and toNames to con to make
              // it simpler while mailing them
              con.toEmail = user.email;
              con.toName = user.name;

              // pass the modified con object for sending emails
              iteratorCB(null, con);
            });

          };

          async.map(users, iterator, function (err, cons) {
            cb(err, cons);
          });
        },


        function sendMessages(cons, cb) {

          // TODO: check if message is notification or email

          if (newMsg.type !== "email") return cb(err, messages);

          var iterator = function (conv, cb) {

            // add message dates
            conv = addTemplateDate(conv);

            var toEmail = conv.toEmail;
            var toName = conv.toName;

            // assume the reply message was the last message
            var msgId = _.last(conv.messages)
              ._id;

            var fromEmail = appEmail(aid);
            var fromName = req.user.name;
            var replyToEmail = appEmail.reply.create({
              aid: conv.aid.toString(),
              type: 'manual',
              messageId: conv._id
            });

            var opts = {

              from: {
                email: fromEmail,
                name: fromName
              },

              locals: {
                conversation: conv
              },

              // pass the message id of the reply
              // this would be used to track if the message was opened
              metadata: {
                'uj_type': 'manual',
                'uj_mid': msgId
              },

              replyTo: {
                email: replyToEmail,
                name: 'Reply to ' + fromName
              },

              subject: conv.sub,

              to: {
                email: toEmail,
                name: toName
              }

            };

            userMailer.sendManualMessage(opts, cb);
          };

          async.map(cons, iterator, function (err) {

            if (err) return cb(err);

            // the cons were modified in the last function, toEmail and toName
            // fields were added to make it easier for sending emails. remove
            // those fields before passing the response
            _.each(cons, function (c) {
              delete c.toEmail;
              delete c.toName;
            });


            cb(null, cons);
          });

        }

      ],

      function callback(err, cons) {

        if (err) return next(err);
        res
          .status(201)
          .json(cons);
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

        function createReplyMessage(cb) {

          reply.accid = accid;

          // add from as 'account'
          reply.from = 'account';

          reply.sName = sName;

          // reply type is always email
          reply.type = 'email';

          Conversation.reply(aid, coId, reply, function (err, con) {
            cb(err, con);
          });

        },

        function sendEmail(conv, cb) {

          User
            .findById(conv.uid)
            .select('email name')
            .exec(function (err, user) {

              // add message dates
              conv = addTemplateDate(conv);

              // assume the reply message was the last message
              var msgId = _.last(conv.messages)
                ._id;

              var fromEmail = appEmail(aid);
              var fromName = req.user.name;
              var replyToEmail = appEmail.reply.create({
                aid: conv.aid.toString(),
                type: 'manual',
                messageId: conv._id
              });


              // clone the conversation, in order to avoid the messages array
              // from being disordered while rendering the mailer template
              var clonedConv = _.cloneDeep(conv);

              var opts = {

                from: {
                  email: fromEmail,
                  name: fromName
                },

                locals: {
                  conversation: clonedConv
                },

                // pass the message id of the reply
                // this would be used to track if the message was opened
                metadata: {
                  'uj_type': 'manual',
                  'uj_mid': msgId
                },

                replyTo: {
                  email: replyToEmail,
                  name: 'Reply to ' + fromName
                },

                subject: conv.sub,

                to: {
                  email: user.email,
                  name: user.name
                }

              };


              userMailer.sendManualMessage(opts, function (err) {
                cb(err, conv);
              });

            })

        }

      ],

      function (err, con) {

        logger.debug('ConversationController Reply', {
          err: !! err,
          con: !! con
        });

        if (err) return next(err);
        res
          .status(201)
          .json(con);
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
    var appName = req.app.name;
    var coId = req.params.coId;


    if (!assignee) {
      return res.badRequest('Provide valid account id (assignee)')
    }

    async.waterfall(
      [

        function getConversationAndCheckAssignee(cb) {

          Conversation
            .findOne({
              _id: coId,
              aid: aid
            })
            .exec(function (err, con) {
              if (err) return cb(err);
              if (!con) return cb(new Error('CONVERSATION_NOT_FOUND'));

              // if the conversation is already assigned to requested account,
              // then move on without sending a redundant email
              var alreadyAssigned = false;
              if (con.assignee.toString() === assignee.toString()) {
                alreadyAssigned = true;
              }

              cb(null, alreadyAssigned, con);
            });
        },

        function assignToTeamMember(alreadyAssigned, con, cb) {

          // if already assigned move on
          if (alreadyAssigned) return cb(null, alreadyAssigned, con);

          con.assignee = assignee;
          con.save(function (err, con) {
            cb(err, alreadyAssigned, con);
          });

        },

        function populateAssigneeNameAndEmail(alreadyAssigned, con, cb) {
          var populate = {
            path: 'assignee',
            select: 'name email'
          };

          con.populate(populate, function (err, conversation) {
            cb(err, alreadyAssigned, conversation);
          });
        },

        function sendMail(alreadyAssigned, con, cb) {

          // if already assigned, dont send mail. move on
          if (alreadyAssigned) return cb(null, alreadyAssigned, con);

          /**
           * require config for dashboard url
           */
          var config = require('../../../config')('api');
          var dashboardUrl = config.hosts['dashboard'];


          var email = con.assignee.email;
          var name = con.assignee.name;
          var avatar = gravatar.get(email, 'R', 60, 'mm');
          var conversationUrl = dashboardUrl + '/apps/' + aid +
            '/messages/conversations/' + con._id;

          var mailOptions = {
            locals: {
              appName: appName,
              gravatar: avatar,
              name: name,
              subject: con.sub,
              conversationUrl: conversationUrl
            },
            to: {
              email: email,
              name: name
            }
          };


          accountMailer.sendAssignConversation(mailOptions, function (err) {
            cb(err, alreadyAssigned, con);
          });
        }
      ],

      function callback(err, alreadyAssigned, conversation) {


        if (err) {

          if (err.message === 'CONVERSATION_NOT_FOUND') {
            return res.notFound('Conversation not found');
          }

          return next(err);
        }

        res.status(200)
          .json(conversation);

      });

  });


module.exports = router;
