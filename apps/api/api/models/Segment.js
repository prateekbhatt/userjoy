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


var eventTypeValidator = require('../../helpers/event-type-validator');
var healthStatusValidator = require('../../helpers/health-status-validator');

var LIST_TYPES = ['users', 'companies'];
var METHOD_TYPES = ['count', 'hasdone', 'hasnotdone', 'attr'];
var OPERATOR_TYPES = ['or', 'and'];

var methodValidator = [validate({
    message: "Invalid filter method type",
    passIfEmpty: true
  },
  'isIn', METHOD_TYPES
)];



/**
 * The filter schema embedded objects should not have a default object id
 * associated with them
 */

var filterSchemaOptions = {
  _id: false
};


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


    op: {
      type: String
    },


    val: {
      type: Schema.Types.Mixed
    }


  },


  filterSchemaOptions
);


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


  // account id of creator
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'Invalid creator account id']
  },


  // created at timestamp
  ct: {
    type: Date,
    default: Date.now
  },


  filters: [SegmentFilterSchema],


  // number of days since when the count queries would be run
  fromAgo: {
    type: Number,
    min: 1
  },


  // if predefined health segment, then store which of good/average/poor
  health: {
    type: String,
    validate: healthStatusValidator
  },


  // list upon segment
  list: {
    type: String,
    required: [true, 'Invalid list'],
    enum: LIST_TYPES
  },


  name: {
    type: String,
    required: [true, 'Invalid segment name']
  },


  // base operator
  op: {
    type: String,
    required: [true, 'Invalid operator'],
    enum: OPERATOR_TYPES
  },


  // whether the segment was pre defined (default health, lifecycle segments)
  predefined: {
    type: Boolean,
    default: false
  },


  // number of days till when the count queries would be run
  toAgo: {
    type: Number,
    min: 0
  },


  // updated at timestamp
  ut: {
    type: Date
  }

});


/**
 * Add indexes
 */

SegmentSchema.index({
  aid: 1
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

  // if count method, then op and val must be present
  // 0 should be an acceptable val value
  _.each(this.filters, function (f) {
    if (f.method === 'count' && !(f.op && (f.val || f.val === 0))) {
      return next(new Error(
        'Provide valid filter operator and filter value'));
    }
  });


  // if fromAgo and toAgo values are provided, then fromAgo must be greater than
  // toAgo
  if (this.fromAgo && this.toAgo && !(this.fromAgo > this.toAgo)) {
    return next(new Error('fromAgo must be greater than toAgo'));
  }


  this.ut = new Date;
  next();
});


/**
 * Creates predefined health / lifecycle segments
 *
 * @param {string} aid app-id
 * @param {string} adminUid app admin would be the default creator
 * @param {function} cb callback
 */

SegmentSchema.statics.createPredefined = function (aid, adminUid, cb) {

  var allNewSegments = [


    // goodHealthSegment
    {
      name: 'Good Health',
      health: 'good',
      filters: [

        {
          method: 'attr',
          name: 'score',
          op: 'gt',
          val: 67
        }

      ]
    },


    // avgHealthSegment
    {
      name: 'Average Health',
      health: 'average',
      filters: [

        {
          method: 'attr',
          name: 'score',
          op: 'gt',
          val: 33
        },


        {
          method: 'attr',
          name: 'score',
          op: 'lt',
          val: 68
        }

      ]
    },


    // poorHealthSegment
    {
      name: 'Poor Health',
      health: 'poor',
      filters: [

        {
          method: 'attr',
          name: 'score',
          op: 'lt',
          val: 34
        }

      ]
    }

  ];

  _.each(allNewSegments, function (s) {

    s.aid = aid;
    s.creator = adminUid;
    s.list = 'users';
    s.op = 'and';
    s.predefined = true;

  });

  Segment.create(allNewSegments, cb);

};


var Segment = mongoose.model('Segment', SegmentSchema);

module.exports = Segment;
