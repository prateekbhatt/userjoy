/**
 * Model for segments belonging to an app
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
 * validations
 */

var LIST_TYPES = ['users', 'companies'];
var METHOD_TYPES = ['count', 'hasdone', 'hasnotdone', 'attr'];
var OPERATOR_TYPES = ['or', 'and'];


/**
 * Define filter schema
 * Filters are embedded documents inside segments
 */

var SegmentFilterSchema = new Schema({


  method: {
    type: 'String',
    required: [true, 'Filter method is required'],
    enum: METHOD_TYPES
  },


  // event type
  type: {
    type: String
  },


  name: {
    type: String
  },


  feature: {
    type: String
  },


  op: {
    type: String
  },


  val: {
    type: String
  }


});


/**
 * Define segment schema
 */

var SegmentSchema = new Schema({


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


  filters: [SegmentFilterSchema],


  // list upon segment
  list: {
    type: String,
    required:[true, 'Invalid list'],
    enum: LIST_TYPES
  },


  // base operator
  op: {
    type: String,
    required: [true, 'Invalid operator'],
    enum: OPERATOR_TYPES
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

SegmentSchema.pre('save', function (next) {
  this.ut = new Date;
  next();
});


var Segment = mongoose.model('Segment', SegmentSchema);

module.exports = Segment;
