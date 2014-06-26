var ajax = require('ajax');
var app = require('./app');
var bind = require('bind');
var debug = require('debug')('uj:notification');
var dom = require('dom');
var getGravatar = require('./get-gravatar');
var template = require('./notification-template');
var user = require('./user');


/**
 * Initialize a new `Notification` instance.
 */

function Notification() {

  this.debug = debug;

  // persist the automessage id of the notification and send it over if the
  // the user replies
  this.automessageId;

  this.app_id;
  this.FETCH_URL;
  this.REPLY_URL;

  this.ERROR_ID = 'uj_error';
  this.NOTIFICATION_TEMPLATE_ID = 'uj_notification';
  this.REPLY_TEMPLATE_ID = 'uj_notification_reply';
  this.SENT_TEMPLATE_ID = 'uj_notification_reply_sent';

}


Notification.prototype.load = function (cb) {

  this.debug('load');

  var appTraits = app.traits();

  // set app and route variables
  this.app_id = appTraits.app_id;
  this.FETCH_URL = appTraits.apiUrl + '/notifications';
  this.REPLY_URL = appTraits.apiUrl + '/conversations';

  var self = this;
  self._fetch(function (err, notf) {

    self.debug('fetch %o : %o', err, notf)

    // If there is an error, it should be logged during debugging
    if (err) {
      self.debug('err %o', err);
      return cb();
    }

    // if there was no notification, return
    if (!notf) return cb();

    // add color to the app traits
    app.setTrait('color', notf.color);

    // If no response, move on
    if (!notf.body) return cb();


    // Persist the automessageId from the notification obj.
    // Would be needed to create a new conversation in case the user
    // replies back
    self.automessageId = notf.amId;

    var userTraits = user.traits();

    // Create locals object which would be passed to render the template
    var locals = {
      sender: notf.sender,
      body: notf.body,
      color: app.traits()
        .color,

      NOTIFICATION_TEMPLATE_ID: self.NOTIFICATION_TEMPLATE_ID,
      REPLY_TEMPLATE_ID: self.REPLY_TEMPLATE_ID,
      SENT_TEMPLATE_ID: self.SENT_TEMPLATE_ID,
      ERROR_ID: self.ERROR_ID,
      img_src: self.img_src,
      gravatar: getGravatar(userTraits.email, 80)
    };


    // render the template with the locals, and insert it into the body
    dom('body')
      .prepend(template(locals));

    cb();
  });

};

Notification.prototype._fetch = function (cb) {


  var self = this;
  var userTraits = user.traits();

  var conditions = {
    app_id: self.app_id
  };

  // if no user identifier, there would be no notification
  if (userTraits.user_id) {
    conditions.user_id = userTraits.user_id;
  } else if (userTraits.email) {
    conditions.email = userTraits.email;
  } else {
    return cb();
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
  var userTraits = user.traits();

  var msg = dom('#' + self.REPLY_TEMPLATE_ID)
    .val();

  if (!msg.length) {
    document.getElementById(self.ERROR_ID)
      .style.display = 'block';
    return;
  }

  var reply = {
    amId: this.automessageId,
    app_id: self.app_id,
    body: msg
  };

  if (userTraits.user_id) {
    reply.user_id = userTraits.user_id;
  } else if (userTraits.email) {
    reply.email = userTraits.email;
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

      setTimeout(function () {
        document.getElementById(self.NOTIFICATION_TEMPLATE_ID)
          .style.display = 'none';
      }, 5000);
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
