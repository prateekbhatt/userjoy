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


  // from email
  fEmail:{
    type: String,
    required: [true, 'Provide from-email']
  },


  // from name
  fName: {
    type: String
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


  // to email
  tEmail: {
    type: String,
    required: [true, 'Provide to-email']
  },


  // message text
  text: {
    type: String,
    required: [true, 'Provide message text']
  },


  // to name
  tName: {
    type: String
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
      fEmail: 1,
      fName: 1,
      replied: 1,
      seen: 1,
      tEmail: 1,
      text: 1,
      tName: 1
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


var Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
