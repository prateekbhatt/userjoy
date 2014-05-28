/**
 * Module dependencies
 */

var _ = require('lodash');


module.exports = function errorHelper(err) {

  // Handle errors created at routes

  if (err.message === '404') {
    return {
      error: 'Not Found',
      status: 404
    }
  }



  if (err.name == 'ValidationError') {

    var messages = {
      'required': "%s is required",
      'min': "%s below minimum",
      'max': "%s above maximum",
      'enum': "%s not an allowed value"
    };

    // A validationerror can contain more than one error.
    var errors = [];

    // Loop over the errors object of the Validation Error
    Object
      .keys(err.errors)
      .forEach(function (field) {

        var eObj = err.errors[field];

        if (eObj.type === "user defined") {

          // if the error has been produced through mongoose-validator

          errors.push(eObj.message);

        } else if (!messages.hasOwnProperty(eObj.type)) {

          // If we don't have a message for `type`, just push the error through

          errors.push(eObj.type);

        } else {

          //Otherwise, use util.format to format the message, and passing the path

          // errors
          //   .push(require('util')
          //     .format(messages[eObj.type], eObj.path));
          //     
          

          // TODO: Modifying the error object to push through the defined message in
          // the model schema. Check other potential problems this could create
          
          errors.push(eObj.message);
        }

      });

    return {
      error: errors,
      status: 400
    };

  } else if (err.name == 'MongoError' && (err.code == 11000 || err.code ==
    11001)) {

    if (_.contains(err.message, '$email')) {
      return {
        error: 'Email already exists',
        status: 400
      };
    }
  }

  return {
    error: 'Internal server error',
    status: 500
  };;

}
