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
 * Define conversation schema
 */

var ConversationSchema = new Schema({


  // assignee
  accId: {
    type: Schema.Types.ObjectId,
    ref: 'Account'
  },


  // app Id
  aid: {
    type: Schema.Types.ObjectId,
    ref: 'App',
    required: [true, 'Invalid aid']
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


  // subject
  sub: {
    type: String,
    required: [true, 'Provide subject']
  },


  // TODO: tid

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
 * Adds updated (ut) timestamps
 * Created timestamp (ct) is added by default
 */

ConversationSchema.pre('save', function (next) {
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
 * Assigns account to conversation
 *
 * @param {string} accId account-id
 * @param {string} coId conversation-id
 * @param {function} cb callback
 */

ConversationSchema.statics.assign = function (coId, accId, cb) {
  var update = {
    $set: {
      accId: accId,
      ut: Date.now()
    }
  };

  Conversation.findByIdAndUpdate(coId, update, cb);
};



var Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = Conversation;
