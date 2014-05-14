/**
 * npm dependencies
 */

var _ = require('lodash');
var async = require('async');


/**
 * Helpers
 */

var getMailerLocals = require('../../helpers/get-mailer-locals');
var logger = require('../../helpers/logger');


/**
 * Models
 */

var AutoMessage = require('../models/AutoMessage');


/**
 * Services
 */

var mailer = require('../services/mailer');


var sendMails = function (type, msg, toArray, cb) {

  var iterator = function (recipient, cb) {

    var toEmail = recipient.email;
    var toName = recipient.name || toEmail;
    var locals = getMailerLocals(type, msg, toName, toEmail);

    var sendFunction = (type === 'auto') ? mailer.sendAutoMessage : mailer.sendManualMessage;

    sendFunction(locals, function (err, responseStatus) {

      if (err) {

        logger.crit({
          at: 'automessage service send',
          type: type,
          toEmail: toEmail,
          err: err,
          res: responseStatus
        });
      } else {
        logger.debug({
          at: 'automessage service send',
          type: type,
          toEmail: toEmail,
          res: responseStatus
        });
      }

      cb(err);
    });

  };

  async.each(toArray, iterator, cb);
};


/**
 * Sends automessage
 *
 * @param {string} aid app-id
 * @param {string} amId automessage-id
 * @param {array} to array of to-name and to-email, e.g. [{name: 'P', email: p@p.co}]
 * @param {function} cb callback
 */

module.exports = function sendAutoMessage(aid, amId, to, callback) {

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
        sendMails('auto', amsg, to, cb);
      }
    ],

    callback
  );
}
