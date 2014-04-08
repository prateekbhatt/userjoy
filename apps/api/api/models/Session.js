/**
 * Model for sessions belonging to an app
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

var SessionSchema = new Schema({

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

  platform: {
    type: String
  },

  country: {
    type: String
  },

  city: {
    type: String
  },

  ip: {
    type: String
  },

  os: {
    type: String
  },

  browser: {
    type: String
  },

  browserVersion: {
    type: String
  },

  // (desktop, mobile, tablet)
  deviceType: {
    type: String
  }

});


/**
 * Adds createdAt timestamps
 * NOTE: We do not need the updatedAt timestamp on a session
 */

SessionSchema.plugin(troop.timestamp, {
  createdPath: 'createdAt',
  useVirtual: false
});


var Session = mongoose.model('Session', SessionSchema);

module.exports = Session;
