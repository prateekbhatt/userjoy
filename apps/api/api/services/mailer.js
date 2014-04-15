// # node-email-templates

// ## Example with [Nodemailer](https://github.com/andris9/Nodemailer)

var path = require('path');
var templatesDir = path.resolve(__dirname, '../..', 'email_templates');
var emailTemplates = require('email-templates');
var nodemailer = require('nodemailer');
var MANDRILL_USER = 'prateek@dodatado.com';
var MANDRILL_PASS = 'yhR70QpRFKF76wmlM7wNRg';


function Mailer(user) {
    
    this.from = 'savinay.90@gmail.com';
    this.to = user.email;
    this.subject = 'default subject';
    this.template = null;
    this.locals = user;

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


Mailer.prototype.send = function () {

    var self = this;
    console.log(templatesDir);

    emailTemplates(templatesDir, function (err, template) {

        if (err) {
            return console.log(err);
        }

        // Send a single email
        template(self.template, self.locals, function (err, html, text) {
            if (err) {
                return console.log(err);
            }

            var opts = {
                from: self.from,
                to: self.to,
                subject: self.subject,
                html: html,
                generateTextFromHTML: true,
                // text: text
            };

            self.transport.sendMail(opts, function (err,
                responseStatus) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(responseStatus.message);
                }

            });
        });
    });
};


/**
 * Sends the news letter
 * @param  {object} user contains the email and other local variables
 */
exports.sendSignupMail = function (user) {
    var mailer = new Mailer(user);
    mailer.subject = 'Welcome to DoDataDo';
    mailer.template = 'signup';
    mailer.send();
};
