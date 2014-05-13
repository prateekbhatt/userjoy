/**
 * npm dependencies
 */

var async = require('async');
var nodemailer = require('nodemailer');
var path = require('path');


/**
 * directory path vars
 */

var templatesDir = path.resolve(__dirname, '../..', 'email_templates');


var MANDRILL_USER = 'prateek@dodatado.com';
var MANDRILL_PASS = 'yhR70QpRFKF76wmlM7wNRg';
var INBOUND_MAIL_DOMAIN = 'mail.userjoy.co';
var UJ_SUPPORT_EMAIL = 'support@userjoy.co';
var UJ_SUPPORT_NAME = 'UserJoy';


/**
 * Helpers
 */

var logger = require('../../helpers/logger');
var render = require('../../helpers/render-message');


//
// USAGE:
//
// var options = {
//   locals: {
//     user: {
//       name: 'Prateek'
//     }
//   },
//   fromEmail: '532d6bf862d673ba7131812e@mail.userjoy.co',
//   fromName: 'Prateek from UserJoy',
//   metadata: {
//     'mId': '535d131c67d02dc60b2b1764'
//   },
//   replyToEmail: '532d6bf862d673ba7131812e+535d131c67d02dc60b2b1764@mail.userjoy.co',
//   replyToName: 'Reply to Prateek from UserJoy',
//   subject: 'Welcome to UserJoy',
//   toEmail: 'prattbhatt@gmail.com',
//   toName: 'Prateek Bhatt',
//   body: 'This is what I wanted to send to {{= user.name || "you" }}'
// };
// mailer.sendToUser(options);
//


/**
 * @constructor Mailer
 */

function Mailer(opts) {

  this.locals = opts.locals;
  this.subject = opts.subject;

  // in case of automessages, the message body must be provided.
  // the message body should be in ejs format,
  // and will be rendered before sending the email
  this.body = opts.body || null;

  // if there is template file, then this should be defined
  this.template = null;

  this.aid = opts.aid;
  this.fromEmail = opts.fromEmail;
  this.fromName = opts.fromName;
  this.mId = opts.mId;
  this.replyToEmail = opts.replyToEmail;
  this.replyToName = opts.replyToName;
  this.toEmail = opts.toEmail;
  this.toName = opts.toName;

  this.html = null;

  return this;
}


// Prepare nodemailer transport object
Mailer.prototype.transport = nodemailer.createTransport("SMTP", {
  // secureConnection: true,
  host: 'smtp.mandrillapp.com',
  port: 587,
  auth: {
    user: MANDRILL_USER,
    pass: MANDRILL_PASS
  }
});


/**
 * Prepend name to email
 * e.g. "Prateek Bhatt <prattbhatt@gmail.com>"
 *
 * @param {string} email
 * @param {string} name
 * @return {string} full email address
 */

Mailer.prototype.createAddress = function (email, name) {
  if (name) {
    email = name + ' <' + email + '>';
  }
  return email;
};


Mailer.prototype.options = function () {

  var opts = {
    from: this.createAddress(this.fromEmail, this.fromName),
    to: this.createAddress(this.toEmail, this.toName),
    subject: this.subject,
    html: this.html,
    generateTextFromHTML: true
  };

  if (this.replyToEmail) {
    opts.replyTo = this.createAddress(this.replyToEmail, this.replyToName);
  }


  if (this.metadata) {
    opts.headers = {
      'X-MC-Metadata': this.metadata
    };
  }

  return opts;

};


/**
 * sends email with the proper template
 */

Mailer.prototype.send = function (cb) {

  var self = this;
  var opts = self.options();

  self.transport.sendMail(opts, function (err, responseStatus) {

    logger.trace({
      at: 'mailer',
      err: err,
      res: responseStatus,
      opts: opts
    });

    cb(err, responseStatus);
  });

};


Mailer.prototype.sendUJMail = function (cb) {

  var self = this;
  var templatePath = path.join(templatesDir, this.template);

  render.file(templatePath, this.locals, function (err, html, text) {
    self.html = html;
    self.send.call(self, cb);
  });

};


/**
 * Sends signup email
 *
 * @param  {object} options contains the email and other local variables
 */

exports.sendSignupMail = function (options, cb) {
  var mailer = new Mailer(options);
  mailer.fromName = UJ_SUPPORT_NAME;
  mailer.fromEmail = UJ_SUPPORT_EMAIL;
  mailer.subject = 'Welcome to DoDataDo';
  mailer.template = 'signup/html.ejs';
  mailer.sendUJMail(cb);
};


/**
 * Sends auto mails from an app to a user
 *
 * @param {object} options
 * @param {function} cb callback
 */

exports.sendAutoMessage = function (options, cb) {
  var mailer = new Mailer(options);

  // render body and subject
  mailer.html = render.string(mailer.body, mailer.locals);
  mailer.subject = render.string(mailer.subject, mailer.locals);

  mailer.send(cb);
};


/**
 * Sends mail to user from app, manually from dashboard
 *
 * @param {object} options
 * @param {function} cb callback
 */

exports.sendManualMessage = function (options, cb) {
  var mailer = new Mailer(options);

  // since the body is already rendered in Conversation controller,
  // we will use the body as the final html output for the mail
  mailer.html = mailer.body;

  mailer.send(cb);
};
