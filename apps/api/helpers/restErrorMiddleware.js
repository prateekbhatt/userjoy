/**
 * Custom middleware to add common rest
 * error helpers to the express response object
 *
 * res.notFound
 * res.badRequest
 * res.unauthorized
 * res.forbidden
 *
 * NOTE: These could be added to the response prototype
 */


/**
 * Module dependencies
 */

var _ = require('lodash');



module.exports = function (req, res, next) {

  var errorFunctions = ['notFound', 'badRequest', 'unauthorized', 'forbidden'];

  _.each(errorFunctions, function isNotDefined(errName) {

    // call error callback if property is already present
    if (res.hasOwnProperty(errName)) {

      var raiseError = new Error(
        errName +
        ' is already defined on express response object.' +
        ' Please change its name in the custom error middleware.'
      );

      return next(raiseError);

    };

  });


  /**
   * send error response in json
   * @param  {number} httpStatus
   * @param  {string} message    Message that is to be appended to err obj
   */
  function sendResponse(httpStatus, message) {

    var errObj = {
      status: httpStatus,
      error: message
    };

    res.json(errObj, httpStatus);

  }


  /**
   * send 404 not found error
   * @param  {string} message custom message to be attached to error response
   */
  res.notFound = function notFound(message) {
    sendResponse(404, message || 'Not Found');
  } ;


  /**
   * send 400 bad request error
   * @param  {string} message custom message to be attached to error response
   */
  res.badRequest = function badRequest(message) {
    sendResponse(400, message || 'Bad Request');
  };


  /**
   * send 401 user is not authorized error
   * @param  {string} message custom message to be attached to error response
   */
  res.unauthorized = function unauthorized(message) {
    sendResponse(401, message || 'Unauthorized');
  };


  /**
   * send 403 forbidden error
   * @param  {string} message custom message to be attached to error response
   */
  res.forbidden = function forbidden(message) {
    sendResponse(403, message || 'Forbidden');
  };


  next();

}
