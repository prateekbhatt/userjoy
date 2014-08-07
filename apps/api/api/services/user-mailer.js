/**
 * npm dependencies
 */

var _ = require('lodash');
var util = require('util');


/**
 * Import mailer super constructor
 */

var BaseMailer = require('./BaseMailer');


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

function Mailer(opts) {
  this.subject = opts.subject;

  // in case of automessages, the message body must be provided.
  // the message body should be in ejs format,
  // and will be rendered before sending the email
  this.body = opts.body || null;

  // for messages being sent to a user, we need to enable tracking variables
  // like aid, mid etc which are part of the metadata object
  this.metadata = opts.metadata;

  this.fromEmail = opts.from.email;
  this.fromName = opts.from.name;

  if (opts.replyTo) {
    this.replyToEmail = opts.replyTo.email;
    this.replyToName = opts.replyTo.name || opts.from.name;
  }

  // inherit constructor properties of BaseMailer
  BaseMailer.call(this, opts);

  return this;
};


/**
 * inherit properties of the mailer super constructor
 */

util.inherits(Mailer, BaseMailer);


Mailer.prototype.options = function () {

  // inherit options from BaseMailer
  var opts = BaseMailer.prototype.options.call(this);

  if (this.replyToEmail) {
    opts.replyTo = this.createAddress(this.replyToEmail, this.replyToName);
  }

  opts.headers = opts.headers || {};

  // enable tracking of user mails only in production environment
  if (process.env.NODE_ENV === 'production') {

    // REF: http://documentation.mailgun.com/user_manual.html#sending-via-smtp
    opts.headers['X-Mailgun-Track'] = 'yes';
    opts.headers['X-Mailgun-Track-Clicks'] = 'yes';
    opts.headers['X-Mailgun-Track-Opens'] = 'yes';

  }

  // // set the Message-Id header for tracking conversation replies and threading
  // // REF: http://blog.mailgun.com/post/tracking-replies-in-mailgun-or-any-other-email/
  // if (this.inReplyTo) opts.messageId = this.inReplyTo;

  // REF: http://documentation.mailgun.com/user_manual.html#attaching-data-to-messages
  opts.headers['X-Mailgun-Variables'] = this.metadata;

  return opts;

};


/**
 * Sends auto mails from an app to a user
 *
 * @param {object} options
 * @param {function} cb callback
 */

exports.sendAutoMessage = function (options, cb) {
  var mailer = new Mailer(options);
  mailer.template = 'automessage.ejs';
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
  mailer.template = 'user-conversation.ejs';
  mailer.send(cb);
};
