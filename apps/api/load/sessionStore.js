/**
 * Stores session data in Redis
 *
 * @param {Object} Express session instance
 * @return {Object} Redis session store instance
 */

module.exports = function (session) {

  var RedisStore = require('connect-redis')(session);
  var sessionStore = new RedisStore();

  return sessionStore;
};
