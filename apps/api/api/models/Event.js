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
    type: Date,
    default: Date.now
  },


  // name of the module
  module: String,


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
 * Create a new track event
 *
 * @param {object} ids (should contain aid, uid, cid)
 * @param {string} action
 * @param {string} module
 * @param {object} meta contains a list of metadata of the event
 * @param {function} cb callback
 */

EventSchema.statics.track = function (ids, name, module, meta, cb) {

  if (arguments.length !== 5) {
    throw new Error('Event.track: Expected five arguments');
  }

  var newEvent = {
    aid: ids.aid,
    cid: ids.cid,
    module: module,
    meta: metadata.toArray(meta),
    name: name,
    type: 'track',
    uid: ids.uid
  };

  Event.create(newEvent, cb);
};


EventSchema.statics.page = function (ids, path, cb) {

  var newEvent = {
    aid: ids.aid,
    cid: ids.cid,
    name: path,
    type: 'page',
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
    type: 'auto',
    uid: ids.uid
  };


  newEvent.meta = [

    {
      k: 'amId',

      // we need to convert it from BSON to String type, since the val field is
      // of Mixed schema type
      //
      // Otherwise querying back the data with a stringified id does not work
      v: ids.amId.toString()
    },

    {
      k: 'state',
      v: state
    }
  ];


  var conditions = {
    aid: ids.aid,
    meta: {

      $all: [

        {
          $elemMatch: newEvent.meta[0]
        },

        {
          $elemMatch: newEvent.meta[1]
        }

      ]
    }
  };

  var update = {
    $setOnInsert: newEvent
  };

  var options = {
    upsert: true
  };

  Event.findOneAndUpdate(conditions, update, options, cb);
};


var Event = mongoose.model('Event', EventSchema);


module.exports = Event;
