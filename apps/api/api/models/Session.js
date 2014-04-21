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
var eventTypeValidator = require('../../helpers/event-type-validator');


var Schema = mongoose.Schema;


/**
 * Define event schema
 * Embedded document inside the session schema
 */

var EventSchema = new Schema({


  // created at
  ct: {
    type: Date,
    default: Date.now,
    required: true
  },


  // url domain
  d: {
    type: String,
    required: [true, 'Invalid domain']
  },


  // name of the feature
  f: {
    type: String
  },


  // name of the action
  // in case of pageview, action == host by default
  n: {
    type: String
  },


  // url path
  p: {
    type: String,
    required: [true, 'Invalid path']
  },


  // type of the event
  t: {
    type: String,
    required: [true, 'Event type is required'],
    validate: eventTypeValidator
  }


});


/**
 * Define session schema
 */

var SessionSchema = new Schema({


  // app Id
  aid: {
    type: Schema.Types.ObjectId,
    ref: 'App',
    required: [true, 'Invalid aid']
  },


  // browser
  br: {
    type: String
  },


  // browser version
  brv: {
    type: String
  },


  // city
  ci: {
    type: String
  },


  // company Id
  cid: {
    type: Schema.Types.ObjectId,
    ref: 'Company'
  },


  // country
  co: {
    type: String
  },


  // created at timestamp
  ct: {
    type: Date,
    default: Date.now
  },


  // device type (desktop, mobile, tablet)
  dv: {
    type: String
  },


  // events
  ev: [EventSchema],


  // ip address
  ip: {
    type: String
  },


  // platform
  pl: {
    type: String
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
 *
 * Difference between the created and updated timestamps would equal the session
 * time
 */

SessionSchema.pre('save', function (next) {
  this.ut = new Date;
  next();
});


/**
 * Adds a new event to an existing session
 * @param  {string}   sid   session id
 * @param  {object}   event the new event object
 * @param  {Function} cb    callback function
 */

SessionSchema.statics.newEvent = function (sid, event, cb) {
  Session.findByIdAndUpdate(sid, { $push: { ev: event }}, cb);
};


var Session = mongoose.model('Session', SessionSchema);

module.exports = Session;
