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


  this.accid = null;
  this.aid = null;
  this.coId = null;
  this.mId = this.getMIdFromToEmail();
  this.teamMemberId = this.getTeamMemberId();
  this.uid = null;


  // console.log('\n\n\n create new event');
  return this;
}


/**
 * extracts team member id from the toEmail
 *
 * @returns {string} team member id
 */

Event.prototype.getTeamMemberId = function () {
  var localName = this.toEmail.split('@')[0];
  var idSplit = localName.split('+');

  return  idSplit[0];
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
    name: self.fromName || self.fromEmail,

    // TODO: remove previous messages from text before saving
    // text: removeQuotedText(toEmail, message.msg.text),
    text: self.text,
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
 * Extracts message id of the parent message from the to-email
 *
 * @return {string} message id
 */

Event.prototype.getMIdFromToEmail = function () {

  var localName = this.toEmail.split('@')[0];
  var idSplit = localName.split('+');
  var mId;

  if (idSplit.length === 2) {
    mId = idSplit[1];
  }

  return mId;
}


/**
 * Finds app from team member id
 *
 * @param {function} cb callback
 */

Event.prototype.getAppFromTeamMemberId = function (cb) {

  var self = this;

  App
    .findOne({
      'team._id': self.teamMemberId
    })
    .exec(function (err, app) {
      if (err) return cb(err);

      if (!app) return cb(new Error('App Not Found'));

      var member = _
        .find(app.team, {
          _id: ObjectId(self.teamMemberId)
        });


      self.aid = app._id;
      self.accid = member.accid;

      cb(null, app);

    });
};


Event.prototype.findAndUpdateMessage = function (cb) {

  var self = this;

  Message
    .findByIdAndUpdate(

      self.mId,

      {
        $set: {
          replied: true
        }
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

      // fetch app data
      function (cb) {
        self.getAppFromTeamMemberId.call(self, cb);
      },

      // fetchParentMessage and update 'replied' status to true
      function (cb) {
        self.findAndUpdateMessage.call(self, cb);
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

      // get app data from team member id
      function (cb) {
        self.getAppFromTeamMemberId(function (err) {
          cb(err);
        });
      },

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

        var newMsg = {
          accid: self.accid,
          aid: self.aid,
          ct: self.ct,
          coId: self.coId,
          from: 'user',
          name: self.fromName || self.fromEmail,
          text: self.text,
          type: 'email',
          sent: true,
          uid: self.uid
        };

        Message.create(newMsg, function (err, savedMsg) {
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
      if (event.type === 'inbound') {


        if (event.mId) {
          return event.processReply.call(event, cb);
        }

        return event.processNewMessage.call(event, cb);
      }

      // FIXME check the event types are correct or not
      // if (e.event === 'send') {
      //   return processSentEvent(e, cb);
      // }

      // if (e.event === 'open') {
      //   return processOpenEvent(e, cb);
      // }

      // if (e.event === 'click') {
      //   return processClickEvent(e, cb);
      // }

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

    _.each(events, function (val, key) {
      console.log(key, val);
      console.log('\n\n\n');
    })

    processMandrillEvents(events, function (err, result) {
      console.log(err, result);
      if (err) return res.json('', 500);
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
