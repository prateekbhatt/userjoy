/**
 * npm dependencies
 */

var async = require('async');
var emailTemplates = require('email-templates');
var ejs = require('ejs');
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


//
// USAGE:
//
// var locals = {
//   fromEmail: '532d6bf862d673ba7131812e@mail.userjoy.co',
//   fromName: 'Prateek from UserJoy',
//   metadata: {
//     'mId': '535d131c67d02dc60b2b1764'
//   },
//   // replyToEmail: '532d6bf862d673ba7131812e+535d131c67d02dc60b2b1764@mail.userjoy.co',
//   // replyToName: 'Reply to Prateek from UserJoy',
//   subject: 'Welcome to UserJoy',
//   toEmail: 'prattbhatt@gmail.com',
//   toName: 'Prateek Bhatt',
//   text: 'This is what I want to send'
// };
// mailer.sendToUser(locals);
//


/**
 * @constructor Mailer
 */

function Mailer(locals) {

  this.locals = locals;
  this.subject = locals.subject;
  this.template = null;

  this.aid = locals.aid;
  this.fromEmail = locals.fromEmail;
  this.fromName = locals.fromName;
  this.mId = locals.mId;
  this.text = locals.text || null;
  this.replyToEmail = locals.replyToEmail;
  this.replyToName = locals.replyToName;
  this.toEmail = locals.toEmail;
  this.toName = locals.toName;

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


Mailer.prototype.renderTemplateFile = function (cb) {

  var self = this;

  // get template
  emailTemplates(templatesDir, function (err, template) {
    if (err) return cb(err);

    // render template
    template(self.template, self.locals, cb);
  });
};


Mailer.prototype.renderTemplateString = function (cb) {
  var self = this;
  var text = self.text;
  var renderedText = ejs.render(text);

  cb(null, renderedText);
};



/**
 * sends email with the proper template
 */

Mailer.prototype.send = function (cb) {

  var self = this;

  async.waterfall(
    [

      // render template
      function (cb) {

        var callback = function (err, html, text) {
          self.html = html;
          cb(err);
        };

        if (self.template) {
          self.renderTemplateFile.call(self, callback);
        } else {
          self.renderTemplateString.call(self, callback);
        }


      },


      // TODO: save html/text message to db here

      // send email
      function (cb) {

        var opts = self.options();

        self.transport.sendMail(opts, function (err, responseStatus) {
          cb(err, responseStatus);
        });

      }

    ],

    function (err, responseStatus) {
      cb(err, responseStatus);
    }
  )

};


/**
 * Sends signup email
 *
 * @param  {object} locals contains the email and other local variables
 */

exports.sendSignupMail = function (locals) {
  var mailer = new Mailer(locals);
  mailer.fromName = UJ_SUPPORT_NAME;
  mailer.fromEmail = UJ_SUPPORT_EMAIL;
  mailer.subject = 'Welcome to DoDataDo';
  mailer.template = 'signup';
  mailer.send();
};


/**
 * Sends mail from an app to a user
 *
 * @param {object} locals
 * @param {function} cb callback
 */

exports.sendToUser = function (locals, cb) {
  var mailer = new Mailer(locals);
  mailer.send(cb);
};
