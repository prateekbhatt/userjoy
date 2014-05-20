/**
 * Model for messages belonging to an app
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
 * Define message schema
 */

var MessageSchema = new Schema({


  accid: {
    type: Schema.Types.ObjectId,
    ref: 'Account'
  },


  // app Id
  aid: {
    type: Schema.Types.ObjectId,
    ref: 'App',
    required: [true, 'Invalid aid']
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


  coId: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: [true, 'Invalid conversation id']
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
  },


  sub: {
    type: String,
    required: [true, 'Provide subject']
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

MessageSchema.pre('save', function (next) {
  this.ut = new Date;
  next();
});


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

  var updateQuery = {};
  updateQuery['$set'] = {};
  updateQuery['$set'][action] = true;

  Message.findByIdAndUpdate(id, updateQuery, function (err, msg) {
    if (err) return cb(err);
    if (!msg) return cb(
      'Message, for which status-update request was made, was not found');
    cb(null, msg);
  });
};


/**
 * Updates clicked status to true
 *
 * @param {string} id message-id
 * @param {function} cb callback
 */

MessageSchema.statics.clicked = function (id, cb) {
  findAndUpdateStatus(id, 'clicked', cb);
};


/**
 * Updates seen status to true
 *
 * @param {string} id message-id
 * @param {function} cb callback
 */

MessageSchema.statics.opened = function (id, cb) {
  findAndUpdateStatus(id, 'seen', cb);
};


/**
 * Updates sent status to true
 *
 * @param {string} id message-id
 * @param {function} cb callback
 */

MessageSchema.statics.sent = function (id, cb) {
  findAndUpdateStatus(id, 'sent', cb);
};


/**
 * When a conversation thread is opened by an app team member, all the messages
 * from the user in the thread are considered opened
 *
 * @param {array} messageIds ids of all messages in a thread
 * @param {function} cb callback
 */

MessageSchema.statics.openedByTeamMember = function (messageIds, cb) {

  var conditions = {
    '_id': {
      '$in': messageIds
    },
    from: 'user'
  };

  var update = {
    'seen': true
  };

  var options = {
    'multi': true
  };

  Message.update(conditions, update, options, cb);

};


var Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
