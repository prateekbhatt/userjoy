/**
 * Model for automessages belonging to an app
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
 * helpers
 */

var logger = require('../../helpers/logger');


/**
 * Define automessage schema
 */

var AutoMessageSchema = new Schema({


  active: {
    type: Boolean,
    default: false
  },


  // app Id
  aid: {
    type: Schema.Types.ObjectId,
    ref: 'App',
    required: [true, 'Invalid aid']
  },


  // body of the message
  body: {
    type: String,
    required: [true, 'Provide automessage body']
  },


  clicked: {
    type: Number,
    default: 0
  },


  creator: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'Invalid creator account id']
  },


  // created at timestamp
  ct: {
    type: Date,
    default: Date.now
  },


  // timestamp of when the automessage was last queued to be run
  lastQueued: {
    type: Date
  },


  replied: {
    type: Number,
    default: 0
  },


  seen: {
    type: Number,
    default: 0
  },


  sent: {
    type: Number,
    default: 0
  },


  // from which account is the automessage being sent
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'Invalid sender account id']
  },


  // segment id
  sid: {
    type: Schema.Types.ObjectId,
    ref: 'Segment',
    required: [true, 'Invalid segment id']
  },


  // subject (for email type)
  sub: {
    type: String,
    // TODO: subject must be provided for type: email
  },


  // a title should be provided to easily identify the AM in the dashboard
  title: {
    type: String,
    required: [true, 'Provide automessage title']
  },


  type: {
    type: String,
    required: [true, 'Provide automessage type'],
    enum: ['email', 'notification']
  },


  // updated at timestamp
  ut: {
    type: Date
  }

});


/**
 * Add indexes
 */

AutoMessageSchema.index({
  aid: 1
});


/**
 * Adds updated (ut) timestamps
 * Created timestamp (ct) is added by default
 */

AutoMessageSchema.pre('save', function (next) {
  this.ut = new Date;
  next();
});


/**
 * Updates the lastQueued property of the AutoMessage
 *
 * @param {string} automessageId
 * @param {function} cb callback
 */

AutoMessageSchema.statics.updateLastQueued = function (automessageId, cb) {

  logger.trace('models/AutoMessage updateLastQueued');

  var update = {
    lastQueued: Date.now()
  };

  AutoMessage.findByIdAndUpdate(automessageId, update, cb);
};


/**
 * Updates the count of clicks/sends/opens/clicks of an automessage
 *
 * @param {string} amId automessage-id
 * @param {string} type sent/seen/clicked/replied
 * @param {function} cb callback
 */

AutoMessageSchema.statics.incrementCount = function (amId, type, cb) {

  if (!_.contains(['sent', 'seen', 'clicked', 'replied'], type)) {
    return cb(new Error(
      'AutoMessage event type must be one of sent/seen/clicked/replied'));
  }

  var update = {};

  update.$inc = {};
  update.$inc[type] = 1;

  AutoMessage.findByIdAndUpdate(amId, update, cb);

};



var AutoMessage = mongoose.model('AutoMessage', AutoMessageSchema);

module.exports = AutoMessage;
