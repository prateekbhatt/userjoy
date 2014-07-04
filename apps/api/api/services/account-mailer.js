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

var UJ_NOREPLY_EMAIL = 'noreply@userjoy.co';
var UJ_NOREPLY_NAME = 'UserJoy';



// USAGE:

// var options = {
//   locals: {
//     user: {
//       name: 'Savinay'
//     }
//   },
//   to: {
//     email: 'savinay.90@gmail.com',
//     name: 'Savinay Narendra'
//   }
// };
// mailer.sendToUser(options);



/**
 * @constructor Mailer
 */

function Mailer(opts) {

  this.fromName = UJ_NOREPLY_NAME;
  this.fromEmail = UJ_NOREPLY_EMAIL;

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
 * Sends Conversation url to assignee
 *
 * @param {object} options
 * @param {function} cb callback
 */

exports.sendAssignConversation = function (options, cb) {
  var mailer = new Mailer(options);
  mailer.subject = 'You have been assigned a new conversation: ' + options.locals.subject;
  mailer.template = 'email-assign.ejs';
  mailer.send(cb);
}

/**
 * Sends Email to Admin when a user replies
 *
 * @param {object} options
 * @param {function} cb callback
 */

exports.sendAdminConversation = function (options, cb) {
  var mailer = new Mailer(options);
  mailer.subject = options.locals.subject;
  mailer.template = 'email-admin-conversation.ejs';
  mailer.send(cb);
}

/**
 * Sends Email to Team members except the user who closes the conversation
 *
 * @param {object} options
 * @param {function} cb callback
 */

exports.sendTeamClosedConversation = function (options, cb) {
  console.log('\n\n\n sendTeamClosedConversation called with', options, cb);
  var mailer = new Mailer(options);
  mailer.subject = options.locals.subject;
  mailer.template = 'email-close-conversation.ejs';
  mailer.send(cb);
}

/**
 * Sends Email to Team members except the user who reopens the conversation
 *
 * @param {object} options
 * @param {function} cb callback
 */

exports.sendTeamReopenConversation = function (options, cb) {
  var mailer = new Mailer(options);
  mailer.subject = options.locals.subject;
  mailer.template = 'email-reopen-conversation.ejs';
  mailer.send(cb);
}

/**
 * Sends Email to Admin when a user replies
 *
 * @param {object} options
 * @param {function} cb callback
 */

exports.sendTeamReplyConversation = function (options, cb) {
  var mailer = new Mailer(options);
  mailer.subject = options.locals.subject;
  mailer.template = 'email-reply.ejs';
  mailer.send(cb);
}

/**
 * FOR TESTING PURPOSE
 *
 * @param {object} options
 * @param {function} cb callback
 */

exports.sendTestMail = function (options, cb) {
  var mailer = new Mailer(options);
  mailer.subject = 'App Name: ' + options.locals.message_subject;
  mailer.template = 'email-assign.ejs';
  mailer.send(cb);
}