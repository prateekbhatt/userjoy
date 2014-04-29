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


  // parent message id
  mId: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },


  replied: {
    type: Boolean,
    default: false
  },


  // message text
  text: {
    type: String,
    required: [true, 'Provide message text']
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
 * Finds messages belonging to an app, sent from users, sorted by created
 * timestamp
 *
 * @param {string} aid app id
 * @param {function} cb callback
 */

MessageSchema.statics.fetchInbox = function (aid, cb) {

  Message
    .find({
      aid: aid,
      from: 'user'
    })
    .select({
      ct: 1,
      replied: 1,
      seen: 1,
      sName: 1,
      text: 1
    })
    .sort({
      ct: -1
    })
    .exec(cb);

};


/**
 * Finds messages belonging to a conversation, sorted by created
 * timestamp
 *
 * @param {string} aid app id
 * @param {string} mId message id
 * @param {function} cb callback
 */

MessageSchema.statics.fetchThread = function (aid, mId, cb) {

  async.waterfall(
    [

      function (cb) {
        Message
          .findById(mId)
          .exec(function (err, msg) {
            cb(err, msg);
          });
      },

      function (msg, cb) {
        Message
          .find({
            coId: msg.coId
          })
          .exec(function (err, msgs) {
            cb(err, msgs);
          });
      }

    ],

    cb
  );

};


/**
 * Updates message status to true for following actions:
 * - clicked
 * - replied
 * - seen
 * - sent
 *
 * @param {string} id message id
 * @param {string} action clicked/replied/seen/sent
 * @param {function} cb callback
 *
 * @api private
 */

function findAndUpdateStatus(id, action, cb) {

  if (!_.contains(['clicked', 'replied', 'seen', 'sent'], action)) {
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
 * Updates replied status to true
 *
 * @param {string} id message-id
 * @param {function} cb callback
 */

MessageSchema.statics.replied = function (id, cb) {
  findAndUpdateStatus(id, 'replied', cb);
};


var Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
