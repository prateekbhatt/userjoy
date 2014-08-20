/**
 * Billing status validator used in user and company models
 */


/**
 * NPM dependencies
 */

var validate = require('mongoose-validator')
  .validate;


var billingStatusValidator = [validate({
    message: "Billing status must be one of 'trial', 'free', 'paying' or 'cancelled'",
    passIfEmpty: true
  },
  'isIn', ['trial', 'free', 'paying', 'cancelled']
)];

module.exports = billingStatusValidator;
