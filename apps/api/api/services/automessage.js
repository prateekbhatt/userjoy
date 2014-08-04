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
 * Models
 */

var Conversation = require('../models/Conversation');


/**
 * Services
 */

var userMailer = require('./user-mailer');


/**
 * Create conversation and send automessage (if type email) to user
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

console.log('\n\n\n\n\nobj obj obj', subdomain, username, sender._id, app.team);

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

      var fromName = sender.name;

      var options = {
        locals: {
          body: con.messages[0].body,
        },
        from: {
          email: fromEmail,
          name: fromName
        },

        // NOTE: tracking should be disabled for test mail
        // metadata: {
        //   'uj_aid': amsg.aid,
        //   'uj_title': amsg.title,
        //   'uj_mid': amsg._id,
        //   'uj_uid': req.user,
        //   'uj_type': 'auto',
        // },

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
        Conversation.updateEmailId(msgId, emailId, cb);
      });

    }


  ],

  cb);

};
