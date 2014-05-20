/**
 * Helpers
 */

var appEmail = require('./app-email');
var logger = require('./logger');


/**
 * e.g. '532d6bf862d673ba7131812e+535d131c67d02dc60b2b1764@mail.userjoy.co'
 */

function replyToEmailManual(fromEmail, conversationId) {
  var emailSplit = fromEmail.split('@');
  var emailLocal = emailSplit[0];
  var emailDomain = emailSplit[1];
  var email = emailLocal + '+' + conversationId + '@' + emailDomain;
  return email;
}


/**
 * NOTE:
 * For automessage, body and subject are rendered afterwards in mailer.js,
 * before being sent
 *
 * For message, body and subject are rendered in the ConversationController
 *
 * @param {string} type message-type (manual/auto)
 * @param {object} msg message-object
 * @param {string} toName name of recipient
 * @param {string} toEmail email of recipient
 *
 * @return {object} locals-object
 */

var getLocals = function (type, msg, toName, toEmail) {

  var body;
  var fromEmail = appEmail(msg.aid);
  var fromName;
  var meta = {};
  var replyToEmail;

  if (type === 'auto') {

    body = msg.body;
    fromName = msg.creator.name;
    meta.amId = msg._id;
    replyToEmail = fromEmail;

  } else if (type === 'manual') {

    body = msg.body;
    meta.mId = msg._id;
    fromName = msg.sName;
    replyToEmail = replyToEmailManual(fromEmail, msg.coId);

  } else {
    throw new Error('Message type must be either manual or auto');
  }

  var locals = {
    body: body,
    fromEmail: fromEmail,
    fromName: fromName || fromEmail,
    metadata: meta,
    replyToEmail: replyToEmail,
    subject: msg.sub,
    toEmail: toEmail,
    toName: toName
  };

  locals.replyToName = 'Reply to ' + locals.fromName;

  return locals;
};


module.exports = getLocals;
