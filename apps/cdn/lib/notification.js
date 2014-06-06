var ajax = require('ajax');
var app = require('./app');
var bind = require('bind');
var debug = require('debug')('uj:notification');
var dom = require('dom');
var template = require('./notification-template');
var user = require('./user');


/**
 * Initialize a new `Notification` instance.
 */

function Notification() {

  var userTraits = user.traits();
  var appTraits = app.traits();
  var apiUrl = appTraits.apiUrl;

  this.app_id = appTraits.app_id;

  this.automessageId;
  this.debug = debug;

  // unique user id as given by app
  this.user_id = userTraits.user_id;

  // email of user
  this.email = userTraits.email;


  this.NOTIFICATION_TEMPLATE_ID = 'uj_notification';
  this.REPLY_TEMPLATE_ID = 'uj_notification_reply';
  this.SENT_TEMPLATE_ID = 'uj_notification_reply_sent';
  this.FETCH_URL = apiUrl + '/notifications';
  this.REPLY_URL = apiUrl + '/conversations';
}


Notification.prototype.load = function () {

  this.debug('load');


  var self = this;

  self._fetch(function (err, notf) {

    // If there is an error, it should be logged during debugging
    if (err) {
      self.debug('err: ' + err);
      return;
    }


    // If no notification found, do not anything
    if (!notf) {
      return;
    }


    // Persist the automessageId from the notification obj.
    // Would be needed to create a new conversation in case the user
    // replies back
    self.automessageId = notf.amId;


    // Create locals object which would be passed to render the template
    var locals = {
      sender: notf.sender,
      body: notf.body,

      NOTIFICATION_TEMPLATE_ID: self.NOTIFICATION_TEMPLATE_ID,
      REPLY_TEMPLATE_ID: self.REPLY_TEMPLATE_ID,
      SENT_TEMPLATE_ID: self.SENT_TEMPLATE_ID
    };


    // render the template with the locals, and insert it into the body
    dom('body')
      .prepend(template(locals));
  });

};

Notification.prototype._fetch = function (cb) {

  var self = this;

  var conditions = {
    app_id: self.app_id
  };


  if (self.user_id) {
    conditions.user_id = self.user_id;
  } else if (self.email) {
    conditions.email = self.email;
  } else {
    return;
  }


  ajax({
    type: 'GET',
    url: self.FETCH_URL,
    data: conditions,
    success: function (msg) {
      self.debug("success: ", msg);
      cb(null, msg);
    },
    error: function (err) {
      self.debug("error", err);
      cb(err);
    }
  });

}


Notification.prototype.show = function () {};


Notification.prototype.hide = function () {
  var id = this.NOTIFICATION_TEMPLATE_ID;

  this.debug('hide', dom(id));

  document.getElementById(id)
    .style.display = 'none';

};


Notification.prototype.reply = function () {

  var self = this;

  var msg = dom('#' + self.REPLY_TEMPLATE_ID)
    .val();

  var reply = {
    amId: this.automessageId,
    app_id: self.app_id,
    body: msg
  };

  if (self.user_id) {
    reply.user_id = self.user_id;
  } else if (self.email) {
    reply.email = self.email;
  } else {
    return;
  }

  this.debug("reply", reply);

  ajax({
    type: "POST",
    url: self.REPLY_URL,
    data: reply,
    success: function () {
      document.getElementById(self.SENT_TEMPLATE_ID)
        .style.display = 'block';
      document.getElementById(self.REPLY_TEMPLATE_ID)
        .value = '';
    },
    error: function (err) {
      self.debug("error: ", err);
    },
    dataType: 'json'
  });
};


/**
 * Expose `Notification` instance.
 */

module.exports = bind.all(new Notification());
