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


  // name of the feature : TODO: Rename feature to module
  feature: String,


  // metadata about the event
  meta: [MetaDataSchema],


  // name of the event
  // NOTE: in case of pageview type, this stores the path
  name: {
    type: String,
    required: [true, 'Invalid event name']
  },


  // type of the event
  type: {
    type: String,
    required: [true, 'Event type is required'],
    validate: eventTypeValidator
  },

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

EventSchema.statics.feature = function (ids, name, feature, meta, cb) {

  if (arguments.length !== 5) {
    throw new Error('Event.feature: Expected five arguments');
  }

  var newEvent = {
    aid: ids.aid,
    cid: ids.cid,
    feature: feature,
    meta: metadata.format(meta),
    name: name,
    type: 'feature',
    uid: ids.uid
  };

  Event.create(newEvent, cb);
};


EventSchema.statics.pageview = function (ids, path, cb) {

  var newEvent = {
    aid: ids.aid,
    cid: ids.cid,
    name: path,
    type: 'pageview',
    uid: ids.uid
  };

  Event.create(newEvent, cb);
};


/**
 * Create a new 'automessage' event
 *
 * This helps in identifying which users have already been sent an automessage
 *
 * To query for an automessage:

        var query = {
          type: 'automessage',
          meta: {
            $all: [

              {
                $elemMatch: {
                  k: 'amId',
                  v: ids.amId
                }
              },


              {
                $elemMatch: {
                  k: 'state',
                  v: 'sent'
                }
              }

            ]
          }
        };

        Event.find(query, function (err, amsg) {
          console.log('did we get the damn event?', amsg);
          cb();
        });
 *
 *
 * @param {object} ids contains the aid, amId, uid
 * @param {string} state sent/opened/clicked/replied
 * @param {string} title the title of the automessage
 * @param {function} cb callback
 */

EventSchema.statics.automessage = function (ids, state, title, cb) {

  if (!ids.aid || !ids.uid || !ids.amId) {
    return cb(new Error('aid/uid/amId are required for automessage events'));
  }


  if (!_.contains(['queued', 'sent', 'opened', 'clicked', 'replied'], state)) {
    return cb(new Error(
      'automessage state must be one of queued/sent/opened/clicked/replied'));
  }


  var newEvent = {
    aid: ids.aid,
    name: title,
    type: 'automessage',
    uid: ids.uid
  };


  newEvent.meta = [

    {
      k: 'amId',
      v: ids.amId
    },

    {
      k: 'state',
      v: state
    }
  ];

  Event.create(newEvent, cb);
};


var Event = mongoose.model('Event', EventSchema);


module.exports = Event;
