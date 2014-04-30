/**
 * Returns the from-email of the app
 *
 * @param {string} aid app id
 * @return {strin} app email address
 */

// TODO : move INBOUND_MAIL_DOMAIN to config.js
var INBOUND_MAIL_DOMAIN = 'mail.userjoy.co';

module.exports = function (aid) {
  return aid + '@' + INBOUND_MAIL_DOMAIN;
}
