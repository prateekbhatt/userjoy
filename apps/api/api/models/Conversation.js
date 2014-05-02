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
 */

ConversationSchema.statics.close = function (coId, cb) {
  var update = {
    closed: true
  };

  Conversation.findByIdAndUpdate(coId, update, cb);
};


var Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = Conversation;
