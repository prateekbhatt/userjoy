/**
 * npm dependencies
 */

var _ = require('lodash');
var util = require('util');


/**
 * Import mailer super constructor
 */

var BaseMailer = require('./BaseMailer');


/**
 * Constants
 */

var UJ_SUPPORT_EMAIL = 'support@userjoy.co';
var UJ_SUPPORT_NAME = 'UserJoy';


/*
USAGE:

var options = {
  locals: {
    user: {
      name: 'Prateek'
    }
  },
  to: {
    email: 'prattbhatt@gmail.com',
    name: 'Prateek Bhatt'
  }
};
mailer.sendToUser(options);

*/

/**
 * @constructor Mailer
 */

function Mailer(opts) {

  this.fromName = UJ_SUPPORT_NAME;
  this.fromEmail = UJ_SUPPORT_EMAIL;

  // inherit constructor properties of BaseMailer
  BaseMailer.call(this, opts);
  return this;
}


/**
 * inherit methods of BaseMailer
 */

util.inherits(Mailer, BaseMailer);


/**
 * Sends email confirmation email
 *
 * @param  {object} options contains the email and other local variables
 */

exports.sendConfirmation = function (options, cb) {
  var mailer = new Mailer(options);
  mailer.subject = 'Welcome to UserJoy';
  mailer.template = 'email-confirmation.ejs';
  mailer.send(cb);
};


/**
 * Sends invite to a new email, to join as a team member
 *
 * @param {object} options
 * @param {function} cb callback
 */

exports.sendInvite = function (options, cb) {
  var mailer = new Mailer(options);
  mailer.subject = 'Invite to join UserJoy';
  mailer.template = 'invite-email.ejs';
  mailer.send(cb);
};

/**
 * Sends installation code to developer
 *
 * @param {object} options
 * @param {function} cb callback
 */

exports.sendInstallCode = function (options, cb) {
  var mailer = new Mailer(options);
  mailer.subject = 'Install Code for UserJoy';
  mailer.template = 'install-code.ejs';
  mailer.send(cb);
};


/**
 * Sends forgot password url
 *
 * @param {object} options
 * @param {function} cb callback
 */

exports.sendForgotPassword = function (options, cb) {
  var mailer = new Mailer(options);
  mailer.subject = 'Forgot Password: UserJoy';
  mailer.template = 'forgot-password.ejs';
  mailer.send(cb);
};

/**
 * FOR TESTING PURPOSE
 *
 * @param {object} options
 * @param {function} cb callback
 */

exports.sendTestMail = function (options, cb) {
  var mailer = new Mailer(options);
  mailer.subject = 'Email Confirmation UserJoy';
  mailer.template = 'email-confirmation.ejs';
  mailer.send(cb);
}
