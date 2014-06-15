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

var billingStatusValidator = require('../../helpers/billing-status-validator');


/**
 * Helpers
 */

var metadata = require('../../helpers/metadata');


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
 * Define schema
 */

var CompanySchema = new Schema({

  aid: {
    type: Schema.Types.ObjectId,
    ref: 'App',
    required: true
  },

  company_id: {
    type: String,
    required: [true, 'Invalid company id']
  },

  meta: [MetaDataSchema],


  name: {
    type: String,
    required: [true, 'INVALID_COMPANY_NAME']
  },


  plan: {
    type: String
  },


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
    default: 0
  },

  lastSessionAt: {
    type: Date
  },

  ct: {
    type: Date
  }

});


/**
 * Adds ut timestamps
 */

CompanySchema.plugin(troop.timestamp, {
  modifiedPath: 'ut',
  useVirtual: false
});


/**
 * If the company exists, fetch the company, else create a new company
 *
 * @param {String} app id
 * @param {Object} company object
 * @param {Function} callback function
 */

CompanySchema.statics.findOrCreate = function (aid, company, cb) {

  company = company || {};

  var billingStatus = company.status;
  var company_id = company.company_id;
  var name = company.name;
  var conditions = {};



  //// VALIDATIONS : START ////

  // if no company identifier provided, return error
  if (!company_id) {
    return cb(new Error('NO_COMPANY_ID'));
  }

  if (!name) {
    return cb(new Error('INVALID_COMPANY_NAME'));
  }


  // if invalid billing status provided, return error
  if (billingStatus && !_.contains(['trial', 'free', 'paying', 'cancelled'],
    billingStatus)) {

    return cb(new Error(
      "Billing status must be one of 'trial', 'free', 'paying' or 'cancelled'"
    ));
  }

  //// VALIDATIONS : END ////




  // add aid to company
  company.aid = aid;

  // format metadata to array
  company.meta = metadata.toArray(company.meta);

  // aid to query
  conditions.aid = aid;

  // add company_id to query conditions
  conditions.company_id = company_id;

  var update = {
    $setOnInsert: company
  };

  var options = {
    upsert: true
  };

  Company.findOneAndUpdate(conditions, update, options, cb);

};


var Company = mongoose.model('Company', CompanySchema);

module.exports = Company;
