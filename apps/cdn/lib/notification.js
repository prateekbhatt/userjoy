var ajax = require('ajax');
var app = require('./app');
var bind = require('bind');
var debug = require('debug')('uj:notification');
var dom = require('dom');
var getGravatar = require('./get-gravatar');
var is = require('is');
var json = require('json');
var template = require('./notification-template');
var user = require('./user');


/**
 * Constants
 */

var ERROR_ID = 'uj_error';
var NOTIFICATION_TEMPLATE_ID = 'uj_notification';
var REPLY_TEMPLATE_ID = 'uj_notification_reply';
var SENT_TEMPLATE_ID = 'uj_notification_reply_sent';
var SEND_MESSAGE_NOTIFICATION_ID = 'uj_send_message_notification_btn';


/**
 * Initialize a new `Notification` instance.
 */

function Notification() {
  this.debug = debug;
}


Notification.prototype.load = function (cb) {

  this.debug('loading ...');

  var self = this;

  var appTraits = app.traits();
  var userTraits = user.traits();

  var ajaxCB = function (err, notf) {

    // If there is an error, it should be logged during debugging
    if (err) {
      return cb(err);
    }

    notf = notf || {};
    is.string(notf) && (notf = json.parse(notf));

    // if there was no notification object in response, return
    if (is.empty(notf)) {
      return cb(new Error('no notification object in response'));
    }

    // add color to the app traits
    app.setTrait('color', notf.color);

    // add showMessageBox status to the app traits
    app.setTrait('showMessageBox', notf.showMessageBox);

    // If no response, move on
    if (!notf.body) {
      return cb(new Error('no new notification found'));
    }

    // Persist the automessageId from the notification obj.
    // Would be needed to create a new conversation in case the user
    // replies back
    app.setTrait('automessageId', notf.amId);

    var gravatar = getGravatar(notf.senderEmail, 80);

    // Create locals object which would be passed to render the template
    var locals = {
      senderName: notf.senderName,
      body: notf.body,
      color: notf.color,

      NOTIFICATION_TEMPLATE_ID: NOTIFICATION_TEMPLATE_ID,
      REPLY_TEMPLATE_ID: REPLY_TEMPLATE_ID,
      SENT_TEMPLATE_ID: SENT_TEMPLATE_ID,
      ERROR_ID: ERROR_ID,
      SEND_MESSAGE_NOTIFICATION_ID: SEND_MESSAGE_NOTIFICATION_ID,
      gravatar: gravatar
    };

    // render the template with the locals, and insert it into the body
    dom('body')
      .prepend(template(locals));

    cb();
  };

  var conditions = {
    app_id: appTraits.app_id
  };

  // if no user identifier, there would be no notification
  if (userTraits.user_id) {
    conditions.user_id = userTraits.user_id;
  } else if (userTraits.email) {
    conditions.email = userTraits.email;
  } else {
    return cb(new Error('user_id or email required to fetch notification'));
  }

  ajax({
    type: 'GET',
    url: appTraits.NOTIFICATION_FETCH_URL,
    data: conditions,
    success: function (notf) {
      ajaxCB(null, notf);
    },
    error: function (err) {
      ajaxCB(err);
    }
  });
};


Notification.prototype.show = function () {};


Notification.prototype.hide = function () {

  this.debug('hiding ...');

  document.getElementById(NOTIFICATION_TEMPLATE_ID)
    .style.display = 'none';
};


Notification.prototype.reply = function () {

  var self = this;
  var appTraits = app.traits();
  var userTraits = user.traits();
  var REPLY_URL = appTraits.CONVERSATION_URL;
  var msg = dom('#' + REPLY_TEMPLATE_ID)
    .val();

  if (!msg.length) {
    document.getElementById(ERROR_ID)
      .style.display = 'block';
    return;
  }

  document.getElementById(SEND_MESSAGE_NOTIFICATION_ID)
    .disabled = true;

  var reply = {
    amId: appTraits.automessageId,
    app_id: appTraits.app_id,
    body: msg
  };

  if (userTraits.user_id) {
    reply.user_id = userTraits.user_id;
  } else if (userTraits.email) {
    reply.email = userTraits.email;
  } else {
    self.debug(new Error('user_id or email required to send reply'));
    return;
  }

  this.debug("replying %o", reply);

  ajax({
    type: "POST",
    url: REPLY_URL,
    data: reply,
    success: function () {

      self.debug('reply sent');

      document.getElementById(SENT_TEMPLATE_ID)
        .style.display = 'block';

      document.getElementById(ERROR_ID)
        .style.display = 'none';

      document.getElementById(REPLY_TEMPLATE_ID)
        .value = '';

      document.getElementById(SEND_MESSAGE_NOTIFICATION_ID)
        .disabled = false;

      setTimeout(function () {
        document.getElementById(NOTIFICATION_TEMPLATE_ID)
          .style.display = 'none';
      }, 2000);
    },
    error: function (err) {
      self.debug(err);
      document.getElementById(SEND_MESSAGE_NOTIFICATION_ID)
        .disabled = false;
    },
    dataType: 'json'
  });
};


/**
 * Expose `Notification` instance.
 */

module.exports = bind.all(new Notification());
