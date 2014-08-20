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

var toArray = function (data) {

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


/**
 * Takes in the 'OUTPUT' in the above example,
 * and returns the 'INPUT'
 */

var toObject = function (data) {

  var formatted = _.reduce(

    data,

    function (obj, val) {

      obj[val.k] = val.v;

      return obj;
    },

    {}
  );

  return formatted;

};


module.exports.toArray = toArray;
module.exports.toObject = toObject;
