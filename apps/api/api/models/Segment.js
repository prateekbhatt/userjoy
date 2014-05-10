/**
 * Model for segments belonging to an app
 */


/**
 * npm dependencies
 */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var validate = require('mongoose-validator')
  .validate;

var Schema = mongoose.Schema;


/**
 * validations
 */

var EVENT_TYPES = ['pageview', 'feature'];
var LIST_TYPES = ['users', 'companies'];
var METHOD_TYPES = ['count', 'hasdone', 'hasnotdone', 'attr'];
var OPERATOR_TYPES = ['or', 'and'];

var methodValidator = [validate({
    message: "Invalid filter method type",
    passIfEmpty: true
  },
  'isIn', METHOD_TYPES
)];


var eventTypeValidator = [validate({
    message: "Invalid filter method type",
    passIfEmpty: true
  },
  'isIn', EVENT_TYPES
)];


/**
 * Define filter schema
 * Filters are embedded documents inside segments
 */

var SegmentFilterSchema = new Schema({


  method: {
    type: 'String',
    required: [true, 'Filter method is required'],
    validate: methodValidator
  },


  // event type
  type: {
    type: String,
    validate: eventTypeValidator
  },


  name: {
    type: String,
    required: [true, 'Name is required in segment filter']
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
    type: Date
  }

});


/**
 * Validation to check if there is atleast one filter
 * Adds updated (ut) timestamps
 * Created timestamp (ct) is added by default
 */

SegmentSchema.pre('save', function (next) {

  // the segment should have atleast one filter
  if (_.isEmpty(this.filters)) {
    return next(new Error('Provide atleast one segment filter'));
  }

  this.ut = new Date;
  next();
});


var Segment = mongoose.model('Segment', SegmentSchema);

module.exports = Segment;
