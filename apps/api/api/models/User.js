/**
 * Model for users belonging to an app
 */


/**
 * Module dependencies
 */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var troop = require('mongoose-troop');
var validate = require('mongoose-validator')
    .validate;

var Schema = mongoose.Schema;


/**
 * Helpers
 */

var metadata = require('../../helpers/metadata');


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


  ct: {
    type: Date
  },


  email: {
    type: String
  },


  healthScore: {
    type: Number
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



  // billing data is stored in both company and user models
  billing: {
    status: {
      type: String,
      validate: billingStatusValidator
    },

    plan: {
      type: String
    },

    currency: {
      type: String
    },

    amount: {
      type: Number
    },

    licenses: {
      type: Number
    },

    usage: {
      type: Number
    },

    unit: {
      type: String
    }
  },

});


/**
 * Adds firstSessionAt and ut timestamps
 */

UserSchema.plugin(troop.timestamp, {
  createdPath: 'firstSessionAt',
  modifiedPath: 'ut',
  useVirtual: false
});


/**
 * If the user exists, fetch the user, else create a new user
 *
 * @param {String} app id
 * @param {Object} user object
 * @param {Function} callback function
 */

UserSchema.statics.getOrCreate = function (aid, user, cb) {

  var email = user.email;
  var user_id = user.user_id;
  var query = {};

  if (!(email || user_id)) {
    return cb(new Error('Please send user_id or email to identify user'));
  }

  // add aid to user
  user.aid = aid;

  // format metadata to array
  user.meta = metadata.toArray(user.meta);

  // aid to query
  query.aid = aid;

  // add user_id or email to query
  if (user_id) {
    query.user_id = user_id;
  } else {
    query.email = email;
  }


  User
    .findOne(query)
    .exec(function (err, usr) {

      if (err) return cb(err);

      if (usr) return cb(null, usr);

      // user not found, create new user
      User
        .create(user, function (err, usr2) {

          if (err) {
            if (err.message === 'Validation failed') {
              if (err.errors['billing.status']) {
                return cb(new Error(err.errors['billing.status'].message));
              }
            }
            return cb(err);
          }

          if (!usr2) return cb(new Error('Error while creating user'));

          cb(null, usr2);

        });

    });

};


var User = mongoose.model('User', UserSchema);

module.exports = User;
