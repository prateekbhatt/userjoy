/**
 * Helpers
 */

var appEmail = require('../../helpers/app-email');
var logger = require('../../helpers/logger');


/**
 * Models
 */

var AutoMessage = require('../models/AutoMessage');


/**
 * Services
 */

var mailer = require('../services/mailer');


/**
 * Creates locals for nodemailer
 *
 * @param {object} automessage
 * @param {string} toName
 * @param {string} toEmail
 *
 * @return {object} locals-object
 */

function getMailLocals(automessage, toName, toEmail) {

  var amsg = automessage;

  var locals = {

    fromEmail: amsg.creator.email,
    fromName: amsg.creator.name || amsg.creator.email,
    metadata: {
      amId: amsg._id
    },

    // TODO : subject has to be rendered
    subject: amsg.sub,

    toEmail: toEmail,
    toName: toName,
    replyToEmail: appEmail(amsg.aid),

    // TODO : body has to be rendered
    body: amsg.body
  };

  locals.replyToName = 'Reply to ' + locals.fromName;


  // TODO : if not test mode, set reply-to email and name

  return locals;
}


/**
 * Sends automessage
 *
 * @param {string} aid app-id
 * @param {string} amId automessage-id
 * @param {array} to array of to-name and to-email, e.g. [{name: 'P', email: p@p.co}]
 * @param {function} cb callback
 */

function sendAutoMessage(aid, amId, to, cb) {

  async.waterfall([

      function findAutoMessage(cb) {
        AutoMessage
          .findOne({
            aid: aid,
            _id: amId
          })
          .populate('creator')
          .exec(function (err, amsg) {
            if (err) return cb(err);
            if (!amsg) return cb(new Error('Message not found'));
            cb(null, amsg);
          });
      },


      function sendMail(amsg, cb) {

        var iterator = function (recipient, cb) {

          var toEmail = recipient.email;
          var toName = recipient.name || toEmail;
          var locals = getMailLocals(amsg, toName, toEmail);

          mailer.sendAutoMessage(locals, function (err, responseStatus) {

            if (err) {

              logger.crit({
                at: 'AutoMessageController send',
                toEmail: toEmail,
                err: err,
                res: responseStatus
              });
            } else {
              logger.debug({
                at: 'AutoMessageController send',
                toEmail: toEmail,
                res: responseStatus
              });
            }

            cb(err);
          });

        };

        async.each(to, iterator, cb);
      }
    ],

    cb
  );
}


module.exports = sendAutoMessage;


/**
 * Expose methods for testing
 */

module.exports._getMailLocals = getMailLocals;
