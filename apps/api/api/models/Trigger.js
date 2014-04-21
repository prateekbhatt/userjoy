/**
 * Model for triggers belonging to an app
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
 * Define trigger schema
 */

var TriggerSchema = new Schema({


  active: {
    type: Boolean,
    default: true
  },


  // app Id
  aid: {
    type: Schema.Types.ObjectId,
    ref: 'App',
    required: [true, 'Invalid aid']
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


  seId: {
    type: Schema.Types.ObjectId,
    ref: 'Segment',
    required: [true, 'Invalid segment id']
  },


  tId: {
    type: Schema.Types.ObjectId,
    ref: 'Template',
    required: [true, 'Invalid template id']
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

TriggerSchema.pre('save', function (next) {
  this.ut = new Date;
  next();
});


var Trigger = mongoose.model('Trigger', TriggerSchema);

module.exports = Trigger;
