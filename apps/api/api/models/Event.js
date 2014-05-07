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
var eventTypeValidator = require('../../helpers/event-type-validator');


var Schema = mongoose.Schema;


/**
 * helpers
 */

var metadata = require('../../helpers/metadata');


/**
 * Define property schema (embedded document)
 */

var MetaDataSchema = new Schema({

    // key
    k: {
      type: Schema.Types.Mixed,
      required: true
    },

    // value
    v: {
      type: Schema.Types.Mixed,
      required: true
    }

  },

  {
    _id: false
  });



/**
 * Define event schema
 */

var EventSchema = new Schema({


  // app Id
  aid: {
    type: Schema.Types.ObjectId,
    ref: 'App',
    required: [true, 'Invalid aid']
  },


  // company Id
  cid: {
    type: Schema.Types.ObjectId,
    ref: 'Company'
  },


  // created at
  ct: {
    type: Date
  },


  // metadata about the event
  d: [MetaDataSchema],


  // user Id
  uid: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Invalid uid']
  }

});


/**
 * Adds updated (ut) timestamps
 * Created timestamp (ct) is added by default
 *
 * Difference between the created and updated timestamps would equal the event
 * time
 */

EventSchema.pre('save', function (next) {


  // TODO : check if proper type is there

  this.ct = new Date;
  next();
});


/**
 * Create a new feature event
 *
 * @param {object} ids (should contain aid, uid, cid)
 * @param {string} action
 * @param {string} feature
 * @param {object} meta contains a list of metadata of the event
 * @param {function} cb callback
 */

EventSchema.statics.feature = function (ids, action, feature, meta, cb) {

  meta = meta || {};

  var newEvent = {
    aid: ids.aid,
    uid: ids.uid,
    cid: ids.cid
  };

  var data = metadata.format(meta) || [];

  data.push({
    k: 'type',
    v: 'feature'
  });

  data.push({
    k: 'action',
    v: action
  });

  data.push({
    k: 'feature',
    v: feature
  });

  newEvent.d = data;

  Event.create(newEvent, cb);
};


EventSchema.statics.pageview = function (ids, host, path, cb) {

  var newEvent = {
    aid: ids.aid,
    uid: ids.uid
  };

  if (ids.cid) {
    newEvent.cid = ids.cid;
  }

  var data = [

    {
      k: 'type',
      v: 'pageview'
    },

    {
      k: 'host',
      v: host
    },

    {
      k: 'path',
      v: path
    }
  ];

  newEvent.d = data;

  Event.create(newEvent, cb);
};


var Event = mongoose.model('Event', EventSchema);


module.exports = Event;
