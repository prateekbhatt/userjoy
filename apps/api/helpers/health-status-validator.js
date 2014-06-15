/**
 * Health status validator used in user, company, segment models
 */


/**
 * NPM dependencies
 */

var validate = require('mongoose-validator')
  .validate;


var validator = [validate({
    message: "Health status must be one of 'good', 'average' or 'bad'",
    passIfEmpty: true
  },
  'isIn', ['good', 'average', 'bad']
)];

module.exports = validator;
