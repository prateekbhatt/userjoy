// # node-email-templates

// ## Example with [Nodemailer](https://github.com/andris9/Nodemailer)

var async = require('async');
var emailTemplates = require('email-templates');
var nodemailer = require('nodemailer');
var path = require('path');


var templatesDir = path.resolve(__dirname, '../..', 'email_templates');


var MANDRILL_USER = 'prateek@dodatado.com';
var MANDRILL_PASS = 'yhR70QpRFKF76wmlM7wNRg';
var INBOUND_MAIL_DOMAIN = 'mail.userjoy.co';



function Mailer(locals) {

  this.locals = locals;
  this.subject = locals.subject;
  this.template = null;

  this.toEmail = locals.toEmail;
  this.fromName = locals.fromName;
  this.fromEmail = locals.fromEmail;
  this.aid = locals.aid;
  this.mId = locals.mId;


  this.from = this.createFromAddress();
  this.replyTo = this.createReplyToAddress();
  this.to = this.createToAddress();

  // Prepare nodemailer transport object
  this.transport = nodemailer.createTransport("SMTP", {
    // secureConnection: true,
    host: 'smtp.mandrillapp.com',
    port: 587,
    auth: {
      user: MANDRILL_USER,
      pass: MANDRILL_PASS
    }
  });

  return this;
}


/**
 * from email should consist of the app id
 * and the name of the sender
 *
 * e.g. if aid is 34324242, then "prateek <34324242@mail.userjoy.co>"
 *
 * @returns {string}  fromEmail address
 */

Mailer.prototype.createFromAddress = function () {

  var email = this.aid + '@' + INBOUND_MAIL_DOMAIN;

  if (this.fromName) {
    email = this.fromName + ' <' + email + '>';
  }

  return email;
}


/**
 * Prepend name to email
 * e.g. "Prateek Bhatt <prattbhatt@gmail.com>"
 *
 * @return {string} full email address
 */

Mailer.prototype.createToAddress = function () {

  var email = this.toEmail;

  if (this.toName) {
    email = this.toName + ' <' + email + '>';
  }

  return email;
}


/**
 * append message id to from email to get the reply-to email
 *
 * if message id is '1234' and fromEmail is 'prateek <567@mail.userjoy.co>',
 * then reply-to email should be 'Reply to prateek <567+1234@mail.userjoy.co>'
 *
 * @return {string} replyTo email address
 */

Mailer.prototype.createReplyToAddress = function () {

  var mId = this.mId;

  var emailSplit = this.from.split('@');
  var local = emailSplit[0];
  var domain = emailSplit[1];
  var email = 'Reply to ' + local + '+' + mId + '@' + domain;

  return email;
};


/**
 * sends email with the proper template
 */

Mailer.prototype.send = function () {

  var self = this;

  async.waterfall(
    [

      // get template
      function (cb) {
        emailTemplates(templatesDir, function (err, template) {
          cb(err, template);
        });
      },


      // render template
      function (template, cb) {

        template(self.template, self.locals, function (err, html, text) {
          cb(err, html, text);
        });
      },


      // TODO: save html/text message to db here

      // send email
      function (html, text, cb) {

        var opts = {
          from: self.from,
          to: self.to,
          replyTo: self.replyTo,
          headers: {
            "X-MC-Metadata": {
              "mId": self.locals.mId
            },
            messageId: this.mId
          },
          subject: self.subject,
          html: html,
          generateTextFromHTML: true
        };


        self.transport.sendMail(opts, function (err, responseStatus) {
          cb(err, responseStatus);
        });

      }

    ],


    function (err, responseStatus) {

      if (err) {
        console.log(err);
      } else {
        console.log(responseStatus.message);
      }
    }
  )

};


/**
 * Sends the news letter
 * @param  {object} locals contains the email and other local variables
 */
exports.sendSignupMail = function (locals) {
  var mailer = new Mailer(locals);
  mailer.subject = 'Welcome to DoDataDo2';
  mailer.template = 'signup';
  mailer.send();
};
