/**
 * Used in Session model
 */


/**
 * NPM dependencies
 */

var _ = require('lodash');


/**
 * Format metadata object to array of key-value pairs
 *
 * INPUT:
 *
 * {
 *   status: 'paying',
 *   friends: 10
 * }
 *
 * OUTPUT:
 *
 * [
 *   { k: 'status', v: 'paying' },
 *   { k: 'friends', v: 10 }
 * ]
 *
 */

var format = function (data) {

  var formatted = _
    .chain(data)
    .map(function (val, key) {
      var newData = {
        k: key,
        v: val
      };

      return newData;
    })
    .value();

  return formatted;

};


module.exports.format = format;
