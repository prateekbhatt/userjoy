// This module contains the BaseMailer constructor function. the account mailer
// and user mailer services inherit from this.


/**
 * npm dependencies
 */

var _ = require('lodash');
var async = require('async');
var juice = require('juice2');
var nodemailer = require('nodemailer');
var path = require('path');


/**
 * directory path vars
 */

var templatesDir = path.resolve(__dirname, '../..', 'email_templates');


var MAILGUN_USER = 'postmaster@mail.userjoy.co';
var MAILGUN_PASS = '5k0o37dg6od7';
var UJ_SUPPORT_EMAIL = 'support@userjoy.co';
var UJ_SUPPORT_NAME = 'UserJoy';


/**
 * Helpers
 */

var logger = require('../../helpers/logger');
var render = require('../../helpers/render-message');


module.exports = BaseMailer;


/*
USAGE:

var options = {
  locals: {
    user: {
      name: 'Prateek'
    }
    body: 'This is what I wanted to send to {{= user.name || "you" }}'
  },
  from: {
    email: '532d6bf862d673ba7131812e@mail.userjoy.co',
    name: 'Prateek from UserJoy'
  },
  metadata: {
    'mId': '535d131c67d02dc60b2b1764'
  },
  replyTo: {
    email: '532d6bf862d673ba7131812e+535d131c67d02dc60b2b1764@mail.userjoy.co',
    name: 'Reply to Prateek from UserJoy'
  },
  subject: 'Welcome to UserJoy',
  to: {
    email: 'prattbhatt@gmail.com',
    name: 'Prateek Bhatt'
  },
};
mailer.sendToUser(options);

*/



/**
 * @constructor BaseMailer
 */

function BaseMailer(opts) {

  this.locals = opts.locals;

  // if there is template file, then this should be defined
  this.template = null;

  this.toEmail = opts.to.email;
  this.toName = opts.to.name;

  this.html = null;

  return this;
}


// Prepare nodemailer transport object
BaseMailer.prototype.transport = nodemailer.createTransport("SMTP", {
  // secureConnection: true,
  host: 'smtp.mailgun.org',
  port: 587,
  auth: {
    user: MAILGUN_USER,
    pass: MAILGUN_PASS
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

BaseMailer.prototype.createAddress = function (email, name) {
  if (name) {
    email = name + ' <' + email + '>';
  }
  return email;
};


BaseMailer.prototype.options = function () {

  var opts = {
    from: this.createAddress(this.fromEmail, this.fromName),
    to: this.createAddress(this.toEmail, this.toName),
    subject: this.subject,
    html: this.html,
    generateTextFromHTML: true,
  };


  // in test env, do not send emails
  // REF 1: http://documentation.mailgun.com/user_manual.html#sending-via-smtp
  // REF 2: http://documentation.mailgun.com/user_manual.html#sending-in-test-mode
  if (!_.contains(['production', 'development'], process.env.NODE_ENV)) {
    opts.headers = opts.headers || {};
    opts.headers['X-Mailgun-Drop-Message'] = 'yes';
    logger.trace({
      at: 'mailer',
      key: 'Using Mailgun Test Mode'
    });
  }

  return opts;

};


/**
 * sends email with the proper template
 */

BaseMailer.prototype.send = function (cb) {

  var self = this;
  var templatePath = path.join(templatesDir, this.template);

  async.waterfall(

    [

      function renderEJSFile(cb) {

        console.log('\n\n\n obj', templatePath);

        render.file(templatePath, self.locals, function (err, html, text) {
          cb(err, html);
        });
      },


      function inlineCSS(renderedHtml, cb) {

        // FIXME : put this in the config file before production
        var opts = {
          url: path.resolve(__dirname, '../../email_templates')
        };

        // inline the html
        juice.juiceContent(renderedHtml, opts, function (err, inlinedHtml) {
          if (err) return cb(err);

          self.html = inlinedHtml;
          cb(null, inlinedHtml);
        });

      },

      function sendEmail(inlinedHtml, cb) {
        var opts = self.options();

        console.log('sendMail');

        self.transport.sendMail(opts, function (err, responseStatus) {
          console.log('sentMail', err, responseStatus);
          cb(err, responseStatus, opts);
        });

      }

    ],


    function callback(err, responseStatus, mailOptions) {

      logger.trace({
        at: 'mailer',
        err: err,
        res: responseStatus,
        opts: mailOptions
      });

      cb(err)
    }

  );

};
