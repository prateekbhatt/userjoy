/**
 * Model for health scores of users
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
 * Define health schema
 */

var HealthSchema = new Schema({


  // app Id
  aid: {
    type: Schema.Types.ObjectId,
    ref: 'App',
    required: [true, 'Invalid aid']
  },


  cid: {
    type: Schema.Types.ObjectId,
    ref: 'Company'
  },


  // created at timestamp
  ct: {
    type: Date,
    default: Date.now
  },


  // health score
  h: {
    type: Number,
    ref: 'Health',
    required: [true, 'Invalid health score']
  },


  uid: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Invalid user id']
  },

});

var Health = mongoose.model('Health', HealthSchema);

module.exports = Health;
