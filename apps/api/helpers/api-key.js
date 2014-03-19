/**
 * Generate api keys using node-uuid
 * and crypto
 *
 * REF: https://gist.github.com/jeffchao/5787194
 */

var uuid = require('node-uuid'),
  crypto = require('crypto'),
  _ = require('lodash');

/**
 * Create new key
 * @return {string} api key
 */

/**
 * Create new key
 * @param  {string} env either 'test' or 'live'
 * @return {string} api key
 */
exports.new = function (env) {

  if (!_.contains([ 'live', 'test' ], env)) {
    throw new Error('Environment must be "test" or "live"');
  }

  var key = uuid();

  key = crypto.createHash('sha256')
  .update(key)
  .update('salt')
  .digest('hex');


  // append env to key
  // e.g. test_23544353565
  // or live_74982367942

  key = [env, key].join('_');

  return key;

};
