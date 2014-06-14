/**
 * Model for users belonging to an app
 */


/**
 * Module dependencies
 */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var validate = require('mongoose-validator')
  .validate;

var Schema = mongoose.Schema;


/**
 * Helpers
 */

var metadata = require('../../helpers/metadata');
var logger = require('../../helpers/logger');


/**
 * Validators
 */

var billingStatusValidator = require('../../helpers/billing-status-validator');


/**
 * Define metadata schema (embedded document)
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
 * Define UserCompany schema
 */

var UserCompanySchema = new Schema({

  cid: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },

  name: {
    type: String
  }

});


/**
 * Define User schema
 */

var UserSchema = new Schema({

  aid: {
    type: Schema.Types.ObjectId,
    ref: 'App',
    required: true
  },


  companies: [UserCompanySchema],


  country: {
    type: String
  },


  ct: {
    type: Date,
    default: Date.now
  },


  email: {
    type: String
  },


  joined: {
    type: Date,
    default: Date.now
  },


  healthScore: {
    type: Number
  },


  ip: {
    type: String
  },


  lastContactedAt: {
    type: Date
  },


  lastHeardAt: {
    type: Date
  },


  lastSessionAt: {
    type: Date
  },


  meta: [MetaDataSchema],


  // name of plan
  plan: {
    type: String
  },


  // amount of revenue from this user
  revenue: {
    type: Number
  },


  // billing status
  status: {
    type: String,
    validate: billingStatusValidator
  },


  totalSessions: {
    type: Number,
    default: 1
  },


  // tags [all tags this user belongs to]
  // notes
  // status (Free, Paying, Cancelled)

  unsubscribed: {
    type: Boolean,
    default: false
  },

  unsubscribedAt: {
    type: Date
  },

  unsubscribedThrough: {
    messageId: {
      type: Schema.Types.ObjectId,
    },
    subject: {
      type: String
    }
  },


  user_id: {
    type: String
  },


  ut: {
    type: Date,
    default: Date.now
  },

});


/**
 * Adds ut timestamps
 * Created timestamp (ct) is added by default
 */

UserSchema.pre('save', function (next) {
  this.ut = new Date;
  next();
});


/**
 * If the user exists, fetch the user, else create a new user
 *
 * @param {String} app id
 * @param {Object} user object
 * @param {Function} callback function
 */

UserSchema.statics.findOrCreate = function (aid, user, cb) {

  user = user || {};

  var billingStatus = user.status;
  var companies = user.companies || [];
  var email = user.email;
  var user_id = user.user_id;
  var conditions = {};



  //// VALIDATIONS : START ////

  // if no user identifier provided, return error
  if (!(email || user_id)) {
    return cb(new Error('NO_EMAIL_OR_USER_ID'));
  }


  // if invalid billing status provided, return error
  if (billingStatus && !_.contains(['trial', 'free', 'paying', 'cancelled'],
    billingStatus)) {

    return cb(new Error(
      "Billing status must be one of 'trial', 'free', 'paying' or 'cancelled'"
    ));
  }


  // if company cid not provided, return error
  for (var i = 0, len = companies.length; i < len; i++) {
    if (!companies[i].cid) {
      return cb(new Error('NO_COMPANY_ID'));
    }
  }

  //// VALIDATIONS : END ////




  // add aid to user
  user.aid = aid;

  // format metadata to array
  user.meta = metadata.toArray(user.meta);

  // aid to query
  conditions.aid = aid;

  // add user_id or email to query
  if (user_id) {
    conditions.user_id = user_id;
  } else {
    conditions.email = email;
  }

  var update = {
    $setOnInsert: user
  };

  var options = {
    upsert: true
  };

  User.findOneAndUpdate(conditions, update, options, cb);

};


var User = mongoose.model('User', UserSchema);

module.exports = User;
