/**
 * Used in Session model
 */


/**
 * NPM dependencies
 */

var validate = require('mongoose-validator')
  .validate;


var validator = [validate({
    message: "Event type must be one of 'auto/form/link/page/track'",
    passIfEmpty: true
  },
  'isIn', ['auto', 'form', 'link', 'page', 'track']
)];

module.exports = validator;
