/**
 * Model for conversations belonging to an app
 */


/**
 * npm dependencies
 */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var troop = require('mongoose-troop');

var Schema = mongoose.Schema;


/**
 * Define embedded message schema
 */

var MessageSchema = new Schema({


  accid: {
    type: Schema.Types.ObjectId,
    ref: 'Account'
  },


  // message body
  body: {
    type: String,
    required: [true, 'Provide message body']
  },


  clicked: {
    type: Boolean,
    default: false
  },


  // created at timestamp
  ct: {
    type: Date,
    default: Date.now
  },


  // is it from a user or an account
  from: {
    type: String,
    required: [true, 'Provide valid from type, either user/account'],
    enum: ['user', 'account']
  },


  type: {
    type: String,
    required: [true, 'Provide message type'],
    enum: ['email', 'notification']
  },


  seen: {
    type: Boolean,
    default: false
  },


  sent: {
    type: Boolean,
    default: false
  },


  // sender name (user or account)
  sName: {
    type: String
  }

});



/**
 * Define conversation schema
 */

var ConversationSchema = new Schema({


  // app Id
  aid: {
    type: Schema.Types.ObjectId,
    ref: 'App',
    required: [true, 'Invalid aid']
  },


  // if conversation was started as a reply to an automessage, then save the id
  // of the automessage
  amId: {
    type: Schema.Types.ObjectId,
    ref: 'AutoMessage'
  },


  // team member who is assigned
  assignee: {
    type: Schema.Types.ObjectId,
    ref: 'Account'
  },


  // is the conversation closed
  closed: {
    type: Boolean,
    default: false
  },


  // created at timestamp
  ct: {
    type: Date,
    default: Date.now
  },


  messages: [MessageSchema],


  // subject
  sub: {
    type: String,
    required: [true, 'Provide subject']
  },


  // true if the conversation has got an unread message from the user
  toRead: {
    type: Boolean,
    default: false
  },


  // user Id
  uid: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Invalid uid']
  },


  // updated at timestamp
  ut: {
    type: Date,
    default: Date.now
  }

});


/**
 * Add indexes
 */

ConversationSchema.index({
  aid: 1,
  uid: 1,
  closed: 1
});


/**
 * Adds updated (ut) timestamps
 * Created timestamp (ct) is added by default
 */

ConversationSchema.pre('save', function (next) {

  if (_.isEmpty(this.messages)) {
    return next(new Error('Conversation must have atleast one message'));
  }


  this.ut = new Date;
  next();
});


/**
 * Updates closed status of conversation to true
 *
 * TODO: Add closed_by to track the account id of the team member who has closed
 * the conversation
 *
 * @param {string} coId conversation-id
 * @param {function} cb callback
 */

ConversationSchema.statics.closed = function (coId, cb) {
  var update = {
    $set: {
      closed: true,
      ut: Date.now()
    }
  };

  Conversation.findByIdAndUpdate(coId, update, cb);
};


/**
 * Reopens closed conversation
 *
 * @param {string} coId conversation-id
 * @param {function} cb callback
 */

ConversationSchema.statics.reopened = function (coId, cb) {
  var update = {
    $set: {
      closed: false,
      ut: Date.now()
    }
  };

  Conversation.findByIdAndUpdate(coId, update, cb);
};


/**
 * Marks conversation as read ('toRead' = false)
 *
 * @param {string} coId conversation-id
 * @param {function} cb callback
 */

ConversationSchema.statics.isRead = function (coId, cb) {
  var update = {
    $set: {
      toRead: false,
      ut: Date.now()
    }
  };

  Conversation.findByIdAndUpdate(coId, update, cb);
};


/**
 * Marks conversation as unread ('toRead' = true)
 *
 * @param {string} coId conversation-id
 * @param {function} cb callback
 */

ConversationSchema.statics.toBeRead = function (coId, cb) {
  var update = {
    $set: {
      toRead: true,
      ut: Date.now()
    }
  };

  Conversation.findByIdAndUpdate(coId, update, cb);
};


/**
 * Creates reply to a conversation
 *
 * @param {string} aid app-id
 * @param {string} coId conversation-id
 * @param {object} reply  reply-message-object
 * @param {function} cb callback
 */

ConversationSchema.statics.reply = function (aid, coId, reply, cb) {

  if (!reply.body) {
    return cb(new Error('Provide message body'));
  }


  if (!_.contains(['user', 'account'], reply.from)) {
    return cb(new Error('Provide valid from type, either user/account'));
  }


  if (!_.contains(['email', 'notification'], reply.type)) {
    return cb(new Error('Provide message type'));
  }


  var conditions = {
    _id: coId,
    aid: aid
  };

  var update = {
    $push: {
      messages: reply
    }
  };

  Conversation.findOneAndUpdate(conditions, update, function (err, con) {

    if (err) return cb(err);
    if (!con) return cb(new Error('Conversation not found'));

    cb(null, con);
  });
};


/**
 * Updates message status to true for following actions:
 * - clicked
 * - seen
 * - sent
 *
 * @param {string} id message id
 * @param {string} action clicked/seen/sent
 * @param {function} cb callback
 *
 * @api private
 */

function findAndUpdateStatus(id, action, cb) {

  if (!_.contains(['clicked', 'seen', 'sent'], action)) {
    return cb(new Error('Invalid Status Update Action'));
  }

  var conditions = {
    'messages._id': id
  };

  var update = {};
  update['$set'] = {};
  update['$set']['messages.$.' + action] = true;

  Conversation
    .update(conditions, update, function (err, numberAffected) {
      if (err) return cb(err);
      if (!numberAffected) return cb(
        'Message, for which status-update request was made, was not found');
      cb(null, numberAffected);
    });
};


/**
 * Updates clicked status to true
 *
 * @param {string} id message-id
 * @param {function} cb callback
 */

ConversationSchema.statics.clicked = function (id, cb) {
  findAndUpdateStatus(id, 'clicked', cb);
};


/**
 * Updates seen status to true
 *
 * @param {string} id message-id
 * @param {function} cb callback
 */

ConversationSchema.statics.opened = function (id, cb) {
  findAndUpdateStatus(id, 'seen', cb);
};


/**
 * Updates sent status to true
 *
 * @param {string} id message-id
 * @param {function} cb callback
 */

ConversationSchema.statics.sent = function (id, cb) {
  findAndUpdateStatus(id, 'sent', cb);
};


/**
 * When a conversation thread is opened by an app team member, all the messages
 * from the user in the thread are considered opened
 *
 * NOTE: This function works recursively because of the following issue:
 * https://jira.mongodb.org/browse/SERVER-1243
 *
 * @param {string} coId conversation-id
 * @param {function} cb callback
 */

function openedByTeamMember(coId, cb) {

  var conditions = {
    _id: coId,
    messages: {
      $elemMatch: {
        "from": 'user',
        "seen": false
      }
    }
  };

  var update = {
    'messages.$.seen': true
  };

  // the multi option does not work with the current mongo version (2.6.0)
  // that is the reason we are calling the function recursively to make sure
  // that all the messages sent from the user are marked as seen
  var options = {
    'multi': true
  };

  Conversation
    .update(conditions, update, options, function (err, numberAffected) {
      if (err) return cb(err);

      // call function recursively until all user messages are marked as seen
      if (numberAffected) return openedByTeamMember(coId, cb);

      cb();
    });

};

ConversationSchema.statics.openedByTeamMember = openedByTeamMember;


var Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = Conversation;
