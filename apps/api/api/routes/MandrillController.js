/**
 * npm dependencies
 */

var _ = require('lodash');
var async = require('async');
var ObjectId = require('mongoose')
  .Types.ObjectId;
var router = require('express')
  .Router();
var winston = require('winston');


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
  this.text = event.msg.text;
  this.toEmail = event.msg.email;
  this.toName = null; // TODO : get this from the event body
  this.metadata = event.msg.metadata;


  this.accid = null;
  this.aid = this.getAppId();
  this.coId = null;
  this.mId = this.getMId();
  this.uid = null;


  // console.log('\n\n\n create new event');
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
    fEmail: self.fromEmail,
    fName: self.fromName,
    from: 'user',
    tEmail: self.toEmail,

    // TODO: remove previous messages from text before saving
    // text: removeQuotedText(toEmail, message.msg.text),
    text: self.text,

    tName: self.toName,
    type: 'email',
    sent: true,
    uid: self.uid

  };

  if (self.mId) {
    newMessage.mId = self.mId;
  }

  Message.create(newMessage, cb);

}


/**
 *
 * if inbound event,
 *   Extracts message id of the parent message from the to-email
 * else if send, open event
 *   gets message id from metadata
 *
 * @return {string} message id
 */

Event.prototype.getMId = function () {

  var mId;

  if (this.type === 'inbound') {
    var localName = this.toEmail.split('@')[0];
    var idSplit = localName.split('+');

    if (idSplit.length === 2) {
      mId = idSplit[1];
    }

  } else if (this.metadata) {

    mId = this.metadata.mId;
  }


  return mId;
}


/**
 * Updates message status to true as follows:
 * - replied (if this.mId = true)
 * - sent (if this.type sent)
 * - open (if this.type open)
 * - click (if type click)
 *
 * @param {function} cb callback
 */

Event.prototype.findAndUpdateMessageStatus = function (cb) {

  var self = this;
  var statusUpdate = {};

  if ((self.type === 'inbound') && self.mId) {
    statusUpdate.replied = true;
  } else if (self.type === 'send') {
    statusUpdate.sent = true;
  } else if (self.type === 'open') {
    statusUpdate.seen = true;
  } else if (self.type === 'click') {
    statusUpdate.clicked = true;
  } else {
    return cb(new Error('Invalid Status Update'));
  }

  Message
    .findByIdAndUpdate(
      self.mId, {
        $set: statusUpdate
      },

      function (err, msg) {

        if (err) return cb(err);

        if (!msg) return cb(new Error('Message Not Found'));

        self.coId = msg.coId;
        self.uid = msg.uid;

        cb(err, msg);
      });
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

  async.series(

    [

      // fetchParentMessage and update 'replied' status to true
      function (cb) {
        self.findAndUpdateMessageStatus.call(self, cb);
      },

      // createMessage
      function (cb) {
        self.createMessage.call(self, function (err, reply) {
          if (err) return cb(err);
          savedReply = reply;
          cb();
        });
      }

    ],

    function (err) {
      cb(err, savedReply);
    });

}


Event.prototype.processNewMessage = function (cb) {

  var self = this;

  async.waterfall(

    [

      // getOrCreate user
      function (cb) {

        var aid = self.aid;
        var newUser = {
          email: self.fromEmail,
          totalSessions: 0,
          ct: self.ct
        };

        User.getOrCreate(aid, newUser, function (err, usr) {
          if (err) return cb(err);

          self.uid = usr._id;
          cb();
        });
      },


      // create new conversation
      function (cb) {

        var newConv = {
          accId: self.accid,
          aid: self.aid,
          ct: self.ct,
          sub: self.subject,
          uid: self.uid
        };

        Conversation.create(newConv, function (err, savedConv) {
          if (err) return cb(err);

          self.coId = savedConv._id;
          cb();
        });
      },


      // create new message
      function (cb) {

        self.createMessage.call(self, function (err, savedMsg) {
          cb(err, savedMsg);
        });
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

//   var delimeter = email;

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

      // according to mandrill's docs, incoming emails will have the event of 'inbound'
      if (event.type === 'inbound' && event.mId) {
        return event.processReply.call(event, cb);
      }

      if (event.type === 'inbound') {
        return event.processNewMessage.call(event, cb);
      }

      if (_.contains(['send', 'open', 'click'], event.type)) {
        return event.findAndUpdateMessageStatus.call(event, cb);
      }

      cb(new Error('Event type ' + e.event + ' not found'));
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

    // _.each(events, function (val, key) {
    //   console.log(key, val);
    //   console.log('\n\n\n');
    // });

    processMandrillEvents(events, function (err, result) {
      // console.log('final output', err, result);
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
