/**
 * npm
 */

var _ = require('lodash');


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


module.exports.reply = {


  /**
   * Format metadata object to array of key-value pairs
   *
   * INPUT:
   *
   * {
   *   aid: 'randomAid123'
   *   type: 'auto',
   *   messageId: abc12345
   * }
   *
   * OUTPUT:
   *
   * randomAid123+a_abc12345@mail.userjoy.com
   *
   * If manual type, append 'm_' instead
   *
   * @param {object} opts
   *        @property {string} aid app-id
   *        @property {string} type auto/manual
   *        @property {string} messageId amId if auto else coId
   */

  create: function (opts) {

    if (_.keys(opts)
      .length !== 3) {
      throw new Error('aid/type/messageId expected');
    }

    var aid = opts.aid;
    var type = opts.type;
    var messageId = opts.messageId;

    if (!_.contains(['auto', 'manual'], type)) {
      throw new Error('type must be one of auto/manual');
    }

    var identifier = ((type === 'auto') ? 'a_' : 'm_') + messageId;
    var replyTo = aid + '+' + identifier + '@' + INBOUND_MAIL_DOMAIN;

    return replyTo;
  },


  /**
   * Takes in the 'OUTPUT' in the above example,
   * and returns the 'INPUT'
   */

  parse: function (email) {

    if (!email) throw new Error('provide valid email')

    var split = email.split('@');
    var beforeAt = split[0];
    var domain = split[1];

    var beforeAtSplit = beforeAt.split('+');
    var aid = beforeAtSplit[0];

    var type;
    var messageId;
    var identifier;
    var parsed;

    if (beforeAtSplit.length > 1) {
      identifier = beforeAtSplit[1];
      parsed = parseIdentifier(identifier);
      type = parsed.type;
      messageId = parsed.messageId;
    }

    var obj = {
      aid: aid,
      type: type,
      messageId: messageId
    };

    return obj;
  }

}

/**
 * Parses the identifier of a replyTo
 *
 * INPUT: a_12345
 * OUTPUT: {
 *   type: 'auto',
 *   messageId: 12345
 * }
 */

function parseIdentifier(identifier) {

  var messageId;
  var identifierSplit = identifier.split('_');
  var type = (identifierSplit[0] === 'm') ? 'manual' : 'auto';

  if (identifierSplit.length > 1) messageId = identifierSplit[1];

  return {
    type: type,
    messageId: messageId
  };
}

module.exports.parseIdentifier = parseIdentifier;
