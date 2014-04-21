/**
 * Used in Session model
 */


/**
 * NPM dependencies
 */

var validate = require('mongoose-validator')
  .validate;


var validator = [validate({
    message: "Event type must be one of 'pageview' or 'feature'",
    passIfEmpty: true
  },
  'isIn', ['pageview', 'feature']
)];

module.exports = validator;
