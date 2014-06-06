var ajax = require('ajax');
var bind = require('bind');
var debug = require('debug')('uj:notification');
var dom = require('dom');
var template = require('./notification-template');
var user = require('./user');


/**
 * Initialize a new `Notification` instance.
 */

function Notification() {

  this.debug = debug;
  this.notification_url = 'TODO';
  this.automessageId;
  this.uid;

  this.TEMPLATE_ID = 'uj_notification';
  this.FETCH_URL = 'http://api.do.localhost/track/notifications';
  this.REPLY_POST_URL = 'http://api.do.localhost/track/notifications/uid';
}


Notification.prototype.load = function () {

  var self = this;

  this.debug('load');

  self.fetch(function (err, notf) {

    // If there is an error, it should be logged during debugging
    if (err) {
      self.debug('err: ' + err);
      return;
    }


    // If no notification found, do not anything
    if (!notf) {
      return;
    }


    // Persist the automessageId and the uid from the notification obj.
    // Would be needed to create a new conversation in case the user
    // replies back
    self.automessageId = notf.amId;
    self.uid = notf.uid;


    // Create locals object which would be passed to render the template
    var locals = {
      sender: notf.sender,
      body: notf.body,
      TEMPLATE_ID: self.TEMPLATE_ID
    };


    // render the template with the locals, and insert it into the body
    dom('body')
      .prepend(template(locals));
  });

};

Notification.prototype.fetch = function (cb) {

  var self = this;

  var userTraits = user.traits();

  // get uid from cookie
  var uid = user.id();

  // unique user id as given by app
  var user_id = userTraits.user_id;

  // email of user
  var email = userTraits.email;

  // if no user identifier, return
  if (!uid && !user_id && !email) {
    self.debug('no user identifier');
    return;
  }

  var conditions = {
    app_id: window._userjoy_id
  };

  if (user_id) {
    conditions.user_id = user_id;
  } else if (email) {
    conditions.email = email
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
  var id = this.TEMPLATE_ID;

  this.debug('hide', dom(id));

  document.getElementById(id)
    .style.display = 'none';

};


Notification.prototype.reply = function () {

  var self = this;

  var data = {
    reply: dom('#reply')
      .val()
  };

  this.debug("reply", data);

  ajax({
    type: "POST",
    url: self.REPLY_POST_URL,
    data: data,
    success: function () {
      document.getElementById('msgsent')
        .style.display = 'block';
      document.getElementById('reply')
        .value = '';
    },
    error: function () {
      console.log("error");
    },
    dataType: 'json'
  });
};


/**
 * Expose `Notification` instance.
 */

module.exports = bind.all(new Notification());
