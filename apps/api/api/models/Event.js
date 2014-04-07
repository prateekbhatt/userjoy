/**
 * Model for events belonging to an app
 */


/**
 * NPM dependencies
 */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var troop = require('mongoose-troop');
var validate = require('mongoose-validator')
  .validate;


var Schema = mongoose.Schema;


/**
 * Define schema
 */

var EventSchema = new Schema({

  appId: {
    type: Schema.Types.ObjectId,
    ref: 'App',
    required: [true, 'Invalid appId']
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Invalid userId']
  },

  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company'
  },

  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: [true, 'Invalid sessionId']
  },

  type: {
    type: String,
    required: true,
    enum: ['feature', 'pageview']
  },

  // name of the feature
  feature: {
    type: String
  },

  // name of the action
  action: {
    type: String
  },

  // host
  host: {
    type: String
  },

  // url path
  path: {
    type: String
  }

});


/**
 * Adds createdAt timestamps
 * NOTE: We do not need the updatedAt timestamp on a event
 */

EventSchema.plugin(troop.timestamp, {
  createdPath: 'createdAt',
  useVirtual: false
});


var Event = mongoose.model('Event', EventSchema);

module.exports = Event;
