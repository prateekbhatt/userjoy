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
var healthStatusValidator = require('../../helpers/health-status-validator');


/**
 * Constants
 */

var DEFAULT_HEALTH = 'average';
var DEFAULT_SCORE = 50;


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


  // browser "Chrome 35", "Firefox 30" etc.
  browser: {
    type: String
  },


  companies: [UserCompanySchema],


  country: {
    type: String
  },


  ct: {
    type: Date,
    default: Date.now
  },


  // "Apple iPad" etc.
  device: {
    type: String
  },


  email: {
    type: String
  },


  joined: {
    type: Date,
    default: Date.now
  },


  // latest health status of the user
  health: {
    type: String,
    validate: healthStatusValidator,
    default: DEFAULT_HEALTH
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


  // last session of user
  lastSeen: {
    type: Date,
    default: Date.now
  },


  meta: [MetaDataSchema],


  // "iOS 5.0" etc.
  os: {
    type: String
  },


  // name of plan
  plan: {
    type: String
  },


  // amount of revenue from this user
  revenue: {
    type: Number
  },


  // latest engagement score
  score: {
    type: Number,
    default: DEFAULT_SCORE,
    min: 0,
    max: 100
  },


  // billing status
  status: {
    type: String,
    validate: billingStatusValidator
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
 * Add indexes
 */

UserSchema.index({
  aid: 1,
  'companies.cid': 1,
  email: 1,
  user_id: 1
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
 * If the user exists, update the lastSeen timestamp to now
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


  // set default values for a new user
  var setOnInsert = _.clone(user);
  setOnInsert.health = DEFAULT_HEALTH;
  setOnInsert.score = DEFAULT_SCORE;


  var update = {
    $setOnInsert: setOnInsert,
    $set: {
      lastSeen: Date.now()
    }
  };

  var options = {
    upsert: true
  };

  User.findOneAndUpdate(conditions, update, options, cb);

};


/**
 * Adds a new company to the user-companies embedded document
 *
 * @param {string} cid company-id
 * @param {string} name name-of-the-company
 * @param {function} cb callback
 */

UserSchema.methods.addCompany = function (cid, name, cb) {

  var self = this;

  // check if the company already belongs to the user
  var exists = _.find(self.companies, function (c) {
    return c.cid.toString() === cid.toString();
  });

  // if company already exists, then return error
  if (!_.isEmpty(exists)) {
    return cb(new Error('USER_ALREADY_BELONGS_TO_COMPANY'));
  }

  // add new company to user
  self.companies.push({
    cid: cid,
    name: name
  });

  // save user
  return self.save(cb);

};


/**
 * Sets health of user to good/average/poor
 *
 * NOTE: Not using findAndModify to let the mongoose validators kick in
 *
 * @param {string} uid user-id
 * @param {string} health good/average/poor
 * @param {function} cb callback
 */

UserSchema.statics.setHealth = function (uid, health, cb) {

  async.waterfall(

    [

      function findUser(cb) {
        User.findById(uid, cb)
      },

      function updateHealth(user, cb) {
        user.health = health;
        user.save(cb);
      }
    ],

    cb
  );

};


/**
 * Sets score of user (0-100)
 *
 * NOTE: Not using findAndModify to let the mongoose validators kick in
 *
 * @param {string} uid user-id
 * @param {string} score (0-100)
 * @param {function} cb callback
 */

UserSchema.statics.setScore = function (uid, score, cb) {

  async.waterfall(

    [

      function findUser(cb) {
        User.findById(uid, cb)
      },

      function updateScore(user, cb) {
        user.score = score;
        user.save(cb);
      }
    ],

    cb
  );

};


/**
 * Updates the lastSeen timestamp of the user to the given or the current time
 *
 * @param {string} uid user-id
 * @param {function} cb callback (optional)
 */

UserSchema.statics.updateLastSeen = function (uid, cb) {

  var update = {
    lastSeen: Date.now()
  };

  User.findByIdAndUpdate(uid, update, function (err) {
    if (cb) return cb(err);
  });

};



var User = mongoose.model('User', UserSchema);

module.exports = User;
