/**
 * npm dependencies
 */

var _ = require('lodash');
var util = require('util');


/**
 * Helpers
 */

var appEmail = require('../../helpers/app-email');
var render = require('../../helpers/render-message');


/**
 * Lib
 */

var createEventAndIncrementCount = require(
  '../lib/create-automessage-event-and-increment-count');


/**
 * Models
 */

var Conversation = require('../models/Conversation');
var Event = require('../models/Event');


/**
 * Services
 */

var userMailer = require('./user-mailer');


/**
 * Create conversation and send automessage (if type email) to user
 *
 * NOTE: if type is email, send the emails
 * else if type is notification, create notifications to be shown later
 *
 * @param {object} amsg automessage
 * @param {object} sender from-account
 * @param {object} user to-user
 * @param {function} cb callback
 */

module.exports = function createAndSendAutoMessage(app, amsg, sender, user, cb) {

  // get fromEmail address from username
  var subdomain = app.subdomain;
  var username = app.getUsernameByAccountId(sender._id);

  var fromEmail = appEmail(username, subdomain);


  async.waterfall([

      function createConversation(cb) {


        // locals to be passed for rendering the templates
        var locals = {
          user: user
        };


        // render body and subject
        var body = render.string(amsg.body, locals);
        var sub = render.string(amsg.sub, locals);


        // create conversation object
        var newConversation = {
          aid: amsg.aid,

          // add amId, since its an automessage
          amId: amsg._id,

          assignee: sender._id,
          messages: [],
          sub: sub,
          uid: user._id
        };


        // create message object
        var newMsg = {
          accid: sender._id,
          body: body,

          // automessages are sent by an 'account'
          from: 'account',

          sName: sender.name,
          type: amsg.type
        };


        // push message into conversation
        newConversation.messages.push(newMsg);

        Conversation.create(newConversation, function (err, con) {
          cb(err, con);
        });
      },


      function sendMail(con, cb) {


        // send email only if type email
        if (amsg.type !== 'email') return cb();


        var fromName = sender.name;

        var options = {
          locals: {
            body: con.messages[0].body,
          },
          from: {
            email: fromEmail,
            name: fromName
          },

          metadata: {
            'uj_aid': amsg.aid,
            'uj_title': amsg.title,
            'uj_mid': amsg._id,
            'uj_uid': user._id,
            'uj_type': 'auto',
          },

          subject: con.sub,
          to: {
            email: user.email,
            name: user.name || user.email
          },
        };

        userMailer.sendAutoMessage(options, function (err, resp) {

          var msgId = con.messages[0]._id;
          var emailId = resp.messageId;

          // update emailId to allow threading
          Conversation.updateEmailId(msgId, emailId, function (err) {
            cb(err);
          });
        });


      },


      // track automessage events here
      function trackAutomessageEvent(cb) {

        var ids = {
          aid: amsg.aid,
          amId: amsg._id,
          uid: user._id
        };

        // NOTE: automessage emails are first 'queued' with mailgun,
        // but we are tracking them as 'sent'
        var state = 'sent';

        var title = amsg.title;


        createEventAndIncrementCount(ids, state, title, cb);

      }


    ],

    cb);

};
