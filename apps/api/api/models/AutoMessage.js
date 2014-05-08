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
 * Define automessage schema
 */

var AutoMessageSchema = new Schema({


  creator: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'Invalid creator account id']
  },


  // app Id
  aid: {
    type: Schema.Types.ObjectId,
    ref: 'App',
    required: [true, 'Invalid aid']
  },


  clicked: {
    type: Number,
    default: 0
  },


  // created at timestamp
  ct: {
    type: Date,
    default: Date.now
  },


  name: {
    type: String
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


  // subject (for email type)
  sub: {
    type: String
  },


  title: {
    type: String
  },


  type: {
    type: String,
    required: [true, 'Provide automessage type'],
    enum: ['email', 'notification']
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

AutoMessageSchema.pre('save', function (next) {
  this.ut = new Date;
  next();
});


var AutoMessage = mongoose.model('AutoMessage', AutoMessageSchema);

module.exports = AutoMessage;
