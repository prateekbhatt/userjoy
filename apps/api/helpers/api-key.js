/**
 * Generate api keys using node-uuid
 * and crypto
 *
 * REF: https://gist.github.com/jeffchao/5787194
 */

var _ = require('lodash');
var crypto = require('crypto');
var uuid = require('node-uuid');


/**
 * Create new key
 * @param  {string} env either 'test' or 'live'
 * @return {string} api key
 */
exports.new = function (env) {

  if (!_.contains([ 'live', 'test' ], env)) {
    var err = new Error('Environment must be "test" or "live"');
    throw err;
  }

  var key = uuid();

  key = crypto.createHash('md5')
  .update(key)
  .update('salt')
  .digest('hex');


  // append env to key
  // e.g. test_23544353565
  // or live_74982367942

  key = [env, key].join('_');

  return key;

};
