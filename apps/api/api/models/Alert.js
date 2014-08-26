/**
 * Model for storing alerts to be sent to team members
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
 * Define alert schema
 */

var AlertSchema = new Schema({


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


  // created at timestamp
  ct: {
    type: Date,
    default: Date.now
  },


  // timestamp of when the alert was last queued to be run
  lastQueued: {
    type: Date
  },


  // segment id
  sid: {
    type: Schema.Types.ObjectId,
    ref: 'Segment',
    required: [true, 'Invalid segment id']
  },


  // updated at timestamp
  ut: {
    type: Date
  },


  // trigger alert on entry / exit into a segment
  when: {
    type: String,
    enum: ['entry', 'exit'],
    required: true,

    // for backwards compatibility
    default: 'entry'
  },

});


/**
 * Add indexes
 */

AlertSchema.index({
  aid: 1
});


/**
 * Adds updated (ut) timestamps
 * Created timestamp (ct) is added by default
 */

AlertSchema.pre('save', function (next) {
  this.ut = new Date;

  next();
});


/**
 * Updates the lastQueued property of the Alert
 *
 * @param {string} alertId
 * @param {function} cb callback
 */

AlertSchema.statics.updateLastQueued = function (alertId, cb) {

  logger.trace('models/Alert updateLastQueued');

  var update = {
    lastQueued: Date.now()
  };

  Alert.findByIdAndUpdate(alertId, update, cb);
};


var Alert = mongoose.model('Alert', AlertSchema);

module.exports = Alert;
