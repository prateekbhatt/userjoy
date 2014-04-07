/**
 * Model for companies belonging to an app
 */


/**
 * NPM dependencies
 */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var troop = require('mongoose-troop');
var validate = require('mongoose-validator')
  .validate;


/**
 * Validators
 */

var billingStatusValidator = [validate({
    message: "Billing status must be one of 'trial', 'free', 'paying' or 'cancelled'",
    passIfEmpty: true
  },
  'isIn', ['trial', 'free', 'paying', 'cancelled']
)];


/**
 * Define schema
 */

var CompanySchema = new Schema({

  appId: {
    type: Schema.Types.ObjectId,
    ref: 'App',
    required: true
  },

  company_id: {
    type: String
  },

  name: {
    type: String
  },

  totalSessions: {
    type: Number,
    default: 0
  },

  lastSessionAt: {
    type: Date
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
    },

    createdAt: {
      type: Date
    }
  }

});


/**
 * Adds updatedAt timestamps
 */

CompanySchema.plugin(troop.timestamp, {
  modifiedPath: 'updatedAt',
  useVirtual: false
});


/**
 * If the company exists, fetch the company, else create a new company
 *
 * @param {String} app id
 * @param {Object} company object
 * @param {Function} callback function
 */

CompanySchema.statics.getOrCreate = function (appId, company, cb) {

  var name = company.name;
  var company_id = company.company_id;
  var query = {};

  if (!(name || company_id)) {
    return cb(new Error('Please send company_id or name to identify company'));
  }

  // add appId to company
  company.appId = appId;

  // appId to query
  query.appId = appId;

  // add company_id or name to query
  if (company_id) {
    query.company_id = company_id;
  } else {
    query.name = name;
  }


  Company
    .findOne(query)
    .exec(function (err, usr) {

      if (err) return cb(err);

      if (usr) return cb(null, usr);

      // company not found, create new company
      Company
        .create(company, function (err, usr2) {

          if (err) {
            if (err.message === 'Validation failed') {
              if (err.errors['billing.status']) {
                return cb(new Error(err.errors['billing.status'].message));
              }
            }
            return cb(err);
          }

          if (!usr2) return cb(new Error('Error while creating company'));

          cb(null, usr2);

        });

    });

};


var Company = mongoose.model('Company', CompanySchema);

module.exports = Company;
