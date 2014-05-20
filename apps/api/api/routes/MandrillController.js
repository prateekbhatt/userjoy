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

var logger = require('../../helpers/logger');


/**
 * Models
 */

var Account = require('../models/Account');
var App = require('../models/App');
var Conversation = require('../models/Conversation');
var Message = require('../models/Message');
var User = require('../models/User');


function Event(event) {

  this.type = event.event;

  // mandrill returns a UTC unix timestamp,
  // we just need to multiply it by 1000 to
  // make it a regular date time
  this.ct = new Date(event.ts * 1000);

  this.fromEmail = event.msg.from_email;
  this.fromName = event.msg.from_name;
  this.subject = event.msg.subject;
  this.body = event.msg.text;
  this.toEmail = event.msg.email;
  this.metadata = event.msg.metadata;


  this.accid = null;
  this.aid = this.getAppId();
  this.coId = this.getCoId();
  this.mId = this.getMId();
  this.uid = null;

  logger.debug({
    at: 'MandrillController new event',
    type: this.type,
    fromEmail: this.fromEmail,
    aid: this.aid,
    mId: this.mId,
    coId: this.coId
  });

  return this;
}


/**
 * extracts app id from the toEmail
 *
 * @returns {string} app id
 */

Event.prototype.getAppId = function () {
  var localName = this.toEmail.split('@')[0];
  var idSplit = localName.split('+');

  return idSplit[0];
};


/**
 * Creates a new message for a given conversation
 *
 * @param {function} cb callback
 */

Event.prototype.createMessage = function (cb) {

  var self = this;

  var newMessage = {

    accid: self.accid,
    aid: self.aid,
    ct: self.ct,
    coId: self.coId,
    from: 'user',
    sent: true,
    sName: self.fromName,
    sub: self.subject,

    // TODO: remove previous messages from body before saving
    // body: removeQuotedText(toEmail, message.msg.body),
    body: self.body,

    type: 'email',
    uid: self.uid

  };

  Message.create(newMessage, cb);

};


/**
 * if inbound event,
 *   Extracts conversation id of the parent message from the to-email
 *
 * @return {string} conversation id
 */

Event.prototype.getCoId = function () {

  var coId;

  if (this.type === 'inbound') {
    var emailLocal = this.toEmail.split('@')[0];
    var split = emailLocal.split('+');

    if (split.length === 2) {
      coId = split[1];
    }

  }

  return coId;
}


/**
 * if (send, open, click) event
 *   gets message id from metadata
 *
 * @return {string} message id
 */

Event.prototype.getMId = function () {
  return this.metadata ? this.metadata.mId : null;
}


/**
 * If user with email exists, then returns it
 * else if user does not exist, creates a new user
 *
 * @param {function} cb callback
 */

Event.prototype.getOrCreateUser = function (cb) {

  var self = this;
  var aid = self.aid;

  var newUser = {
    email: self.fromEmail,
    totalSessions: 0,
    ct: self.ct
  };

  User.getOrCreate(aid, newUser, cb);
};


/**
 * Creates a reply for a sent message
 * - Updates replied status to true
 * - Fetches conversation
 * - Creates new message
 *
 * @param {function} cb callback
 */

Event.prototype.processReply = function (cb) {

  var self = this;
  var savedReply;

  logger.trace('MandrillController processReply');

  async.waterfall(

    [

      function getOrCreateUser(cb) {
        self.getOrCreateUser.call(self, function (err, user) {
          if (err) return cb(err);
          self.uid = user._id;
          cb();
        });
      },

      function createMessage(cb) {
        self.createMessage.call(self, cb);
      },

      function conversationToBeRead(msg, cb) {
        Conversation.toBeRead(self.coId, function (err, con) {
          cb(err, msg);
        });
      }

    ],

    cb);

};


Event.prototype.processNewMessage = function (cb) {

  var self = this;

  logger.trace('MandrillController processNewMessage');

  async.waterfall(

    [

      function getOrCreateUser(cb) {
        self.getOrCreateUser.call(self, function (err, user) {
          if (err) return cb(err);
          self.uid = user._id;
          cb();
        });
      },


      function createConversation(cb) {

        var newConv = {
          accId: self.accid,
          aid: self.aid,
          ct: self.ct,
          sub: self.subject,
          toRead: true,
          uid: self.uid
        };

        Conversation.create(newConv, function (err, con) {
          if (err) return cb(err);
          self.coId = con._id;
          cb();
        });
      },


      function createMessage(cb) {
        self.createMessage.call(self, cb);
      }

    ],

    cb);

}


// /**
//  * Removes quoted text
//  *
//  * @param {string} text
//  * @return {string} trimmed text
//  */

// function removeQuotedText(email, text) {

//   var delimeter = '##- Please type your reply above this line -##';

//   // escaping the dot in .com, so it doesn't affect our regex pattern below
//   delimeter.replace('.', '\\.');

//   // this matches from the beginning of the email, multiple lines, until the line
//   // the has the delimeter, lines under the delimeter (including the delimeter line) won't match
//   var pattern = '.*(?=^.*' + delimeter + '.*$)';

//   // we are using XRegExp
//   var regex = xregexp(pattern, 'ims');

//   var delimeterFound = xregexp.test(text, regex);

//   if (delimeterFound) {
//     var match = xregexp.exec(text, regex);
//     return trimNewLines(match[0]);
//   } else {
//     return trimNewLines(text);
//   }
// }


/**
 * Email clients usually add extra white lines after the reply, this function
 * removes empty new lines before and after the passed in text
 *
 * @param {string} text
 * @return {string} trimmed text
 */

function trimNewLines(text) {
  return text.replace(/^\s+|\s+$/g, '');
}


/**
 * Processes mandrill events based on the type of event
 *
 * @param {object} events
 * @param {function} cb callback
 */

function processMandrillEvents(events, cb) {

  // here we are using async to process the replies, note that mandrill could
  // send us a batch of replies, so we need to be able to process multiple replies
  async.each(

    events,

    function (e, cb) {

      var event = new Event(e);
      var type = event.type;
      var coId = event.coId;
      var mId = event.mId;

      // according to mandrill's docs, incoming emails will have the event of 'inbound'
      if (type === 'inbound' && coId) {
        return event.processReply.call(event, cb);
      }

      if (type === 'inbound') {
        return event.processNewMessage.call(event, cb);
      }

      if (type === 'send') {
        return Message.sent(mId, cb);
      }

      if (type === 'open') {
        return Message.opened(mId, cb);
      }

      if (type === 'click') {
        return Message.clicked(mId, cb);
      }

      cb(new Error('Event type ' + type + ' not found'));
    },

    cb
  );
}


/**
 * POST /mandrill
 *
 * Recieves new messages
 * Also, Track sent, open, click events
 */

router
  .route('/')
  .post(function (req, res, next) {

    var events = JSON.parse(req.body.mandrill_events);

    processMandrillEvents(events, function (err, result) {

      if (err) {

        logger.crit({
          at: 'MandrillController Output',
          err: err
        });

      } else {

        logger.debug('MandrillController Output');

      }

      res.json();
    });

  });


module.exports = router;


/**
 * Expose functions for testing
 */

module.exports._test = {
  Event: Event
};
