var ajax = require('ajax');
var app = require('./app');
var bind = require('bind');
var callback = require('callback');
var canonical = require('canonical');
var clone = require('clone');
var company = require('./company');
var cookie = require('./cookie');
var debug = require('debug')('uj:userjoy');
var defaults = require('defaults');
var each = require('each');
var is = require('is');
var isEmail = require('is-email');
var isMeta = require('is-meta');
var json = require('json');
var message = require('./message');
var newDate = require('new-date');
var notification = require('./notification');
var on = require('event')
  .bind;
var platform = require('platform.js');
var prevent = require('prevent');
var queue = require('./queue');
var size = require('object')
  .length;
var url = require('url');
var user = require('./user');


/**
 * Expose `UserJoy`.
 */

module.exports = UserJoy;


/**
 * Initialize a new `UserJoy` instance.
 */

function UserJoy() {
  this.debug = debug;

  // FIXME before going live
  this._timeout = 200;

  // FIXME before going live
  // var API_URL = 'http://api.do.localhost';
  
  // Change while testing in localhost
  var API_URL = 'http://api.userjoy.co';

  this.TRACK_URL = API_URL + '/track';
  this.IDENTIFY_URL = API_URL + '/track/identify';
  this.COMPANY_URL = API_URL + '/track/company';

  bind.all(this);
}


/**
 * Initialize.
 *
 * @return {UserJoy}
 */

UserJoy.prototype.initialize = function () {
  var self = this;

  this.debug('initialize');

  // set the app id
  this.aid = window._userjoy_id;

  // set tasks which were queued before initialization
  queue
    .create(window.userjoy)
    .prioritize();

  // invoke queued tasks
  this._invokeQueue();

  app.identify({
    app_id: window._userjoy_id,

    // FIXME change before production
    apiUrl: self.TRACK_URL
  });


  // FIXME: THIS CODE IS NOT TESTED
  notification.load(function (err) {

    self.debug('loaded', err);

    // load css file for message
    message.loadCss();

    message.load();
  });


  this.debug('INITIALIZED:: %o', this);

  return this;
};


/**
 * Invoke tasks which have been queued
 *
 * @return {UserJoy}
 */

UserJoy.prototype._invokeQueue = function () {
  for (var i = queue.tasks.length - 1; i >= 0; i--) {
    this.push(queue.tasks.shift());
  };

  return this;
};

/**
 * Identify a user by  `traits`.
 *
 * @param {Object} traits (optional)
 * @param {Function} fn (optional)
 * @return {UserJoy}
 */

UserJoy.prototype.identify = function (traits, fn) {
  var self = this;

  this.debug('identify');

  if (!is.object(traits)) {
    this.debug('err: userjoy.identify must be passed a traits object');
    return;
  }

  // if no user identifier, return
  if (!traits.user_id && !traits.email) {
    self.debug('userjoy.identify must provide the user_id or email');
    return;
  }

  // add special context to user traits browser, os

  // add device type "Apple iPad"
  var device = (platform.manufacturer ? platform.manufacturer + ' ' : '') +
    (platform.product ? platform.product : '');
  device && (traits.device = device);

  // add browser type, "Chrome 35"
  traits.browser = (platform.name ? platform.name + ' ' : '') +
    (platform.version ? platform.version : '');

  // add browser os, "Linux 64-bit"
  traits.os = platform.os.toString();

  // set user traits
  user.identify(traits);

  var data = {
    app_id: self.aid,
    user: user.traits()
  };

  ajax({
    type: 'GET',
    url: self.IDENTIFY_URL,
    data: data,
    success: function (ids) {
      self.debug("identify success: %o", ids);
      ids || (ids = {});

      // set uid to cookie
      cookie.uid(ids.uid);
    },
    error: function (err) {
      self.debug("identify error: %o", err);
    }
  });

  this._callback(fn);
  return this;
};


/**
 * Identify a company by `traits`.
 *
 * @param {Object} traits (optional)
 * @param {Function} fn (optional)
 * @return {UserJoy}
 */

UserJoy.prototype.company = function (traits, fn) {
  var self = this;

  this.debug('company');

  if (!is.object(traits)) {
    this.debug('err: userjoy.company must be passed a traits object');
    return;
  }

  // if no company identifier, return
  if (!traits.company_id) {
    self.debug('userjoy.company must provide the company_id');
    return;
  }

  company.identify(traits);
  var uid = cookie.uid();
  var data = {
    app_id: self.aid,
    u: uid,
    company: company.traits()
  };

  ajax({
    type: 'GET',
    url: self.COMPANY_URL,
    data: data,
    success: function (ids) {
      self.debug("company success: %o", ids);
      ids || (ids = {});

      // set cid to cookie
      cookie.cid(ids.cid);
    },
    error: function (err) {
      self.debug("company error: %o", err);
    }
  });

  this._callback(fn);
  return this;
};


/**
 * Track an `event` that a user has triggered with optional `properties`.
 *
 * @param {String} event
 * @param {String} module (optional)
 * @param {Object} properties (optional)
 * @param {Function} fn (optional)
 * @return {UserJoy}
 */

UserJoy.prototype.track = function (name, module, properties, fn) {


  this.debug('track', name, properties);

  if (is.fn(properties)) fn = properties, properties = null;
  if (is.fn(module)) fn = module, module = properties = null;


  this._sendEvent('track', name, module, properties);

  this._callback(fn);
  return this;
};


/**
 * Helper method to track an outbound link that would normally navigate away
 * from the page before the analytics calls were sent.
 *
 * @param {Element or Array} links
 * @param {String or Function} name
 * @param {String or Function} module (optional)
 * @param {Object or Function} properties (optional)
 * @return {UserJoy}
 */

UserJoy.prototype.track_link = function (links, name, module, properties) {
  if (!links) return this;
  if (is.string(links)) links = [links]; // always arrays, handles jquery
  if (is.object(module)) properties = module, module = null;


  var self = this;
  each(links, function (el_id) {

    // get the dom element
    var el = window.document.getElementById(el_id);

    on(el, 'click', function (e) {

      // TODO: test the next lines
      var ev = is.fn(name) ? name(el) : name;
      var module = is.fn(module) ? module(el) : module;
      var props = is.fn(properties) ? properties(el) : properties;


      // self.track(ev, props);
      self._sendEvent('link', ev, null, props);

      if (el.href && el.target !== '_blank' && !isMeta(e)) {
        prevent(e);
        self._callback(function () {
          window.location.href = el.href;
        });
      }
    });
  });

  return this;
};


/**
 * Helper method to track an outbound form that would normally navigate away
 * from the page before the analytics calls were sent.
 *
 * @param {Element or Array} forms
 * @param {String or Function} name
 * @param {String or Object or Function} module
 * @param {Object or Function} properties (optional)
 * @return {UserJoy}
 */

UserJoy.prototype.track_form = function (forms, name, module, properties) {


  if (!forms) return this;
  if (is.string(forms)) forms = [forms]; // always arrays, handles jquery
  if (is.object(module)) properties = module, module = null;

  var self = this;
  each(forms, function (el_id) {

    // get the dom element
    var el = window.document.getElementById(el_id);

    function handler(e) {
      prevent(e);

      // TODO: check the next lines
      var ev = is.fn(name) ? name(el) : name;
      var module = is.fn(module) ? module(el) : module;
      var props = is.fn(properties) ? properties(el) : properties;

      // self.track(ev, props);
      self._sendEvent('form', ev, module, props);

      self._callback(function () {
        el.submit();
      });
    }


    // support the events happening through jQuery or Zepto instead of through
    // the normal DOM API, since `el.submit` doesn't bubble up events...
    var $ = window.jQuery || window.Zepto;
    if ($) {
      $(el)
        .submit(handler);
    } else {
      on(el, 'submit', handler);
    }
  });

  return this;
};


/**
 * Trigger a pageview, labeling the current page with an optional `module`,
 * `name` and `properties`.
 *
 * @param {String} name (optional)
 * @param {String} module (optional)
 * @param {Object or String} properties (or path) (optional)
 * @param {Function} fn (optional)
 * @return {UserJoy}
 */

UserJoy.prototype.page = function (name, module, properties, fn) {

  name = name || canonicalPath();

  if (is.fn(properties)) fn = properties, properties = null;
  if (is.fn(module)) fn = module, properties = module = null;
  if (is.object(module)) properties = module, module = null;

  // var defs = {
  //   path: canonicalPath(),
  //   referrer: document.referrer,
  //   title: document.title,
  //   url: canonicalUrl(),
  //   search: location.search
  // };

  // if (name) defs.name = name;

  // if (category) defs.category = category;

  // properties = clone(properties) || {};
  // defaults(properties, defs);

  this._sendEvent('page', name, module, properties);

  this._callback(fn);
  return this;
};


/**
 * Set the `timeout` (in milliseconds) used for callbacks.
 *
 * @param {Number} timeout
 */

UserJoy.prototype.timeout = function (timeout) {
  this._timeout = timeout;
};


/**
 * Callback a `fn` after our defined timeout period.
 *
 * @param {Function} fn
 * @return {UserJoy}
 * @api private
 */

UserJoy.prototype._callback = function (fn) {
  callback.async(fn, this._timeout);
  return this;
};


/**
 *
 * Send event data to UserJoy API
 *
 * @param {String} type of event
 * @param {Object} traits of event
 * @return {UserJoy}
 * @api private
 */

UserJoy.prototype._sendEvent = function (type, name, module, properties) {

  var self = this;
  // TODO: send data to userjoy api here

  var uid = cookie.uid();
  var cid = cookie.cid();

  var data = {
    app_id: self.aid,
    e: {
      type: type,
      name: name,
    },
    u: uid
  };

  if (cid) data.c = cid;

  if (module) data.e.module = module;
  if (properties) data.e.meta = properties;


  ajax({
    type: 'GET',
    url: self.TRACK_URL,
    data: data,
    success: function (msg) {
      self.debug("success " + msg);
    },
    error: function (err) {
      self.debug("error " + err);
    }
  });

  return this;
};


/**
 * Push `args`.
 *
 * @param {Array} args
 * @api private
 */

UserJoy.prototype.push = function (args) {
  var method = args.shift();

  if (!this[method]) return;
  this[method].apply(this, args);
};

/**
 * Return the canonical path for the page.
 *
 * @return {String}
 */

function canonicalPath() {
  var canon = canonical();
  if (!canon) return window.location.pathname;
  var parsed = url.parse(canon);
  return parsed.pathname;
}

/**
 * Return the canonical URL for the page, without the hash.
 *
 * @return {String}
 */

function canonicalUrl() {
  var canon = canonical();
  if (canon) return canon;
  var url = window.location.href;
  var i = url.indexOf('#');
  return -1 == i ? url : url.slice(0, i);
}


/**
 * Expose function to hide notification
 */

UserJoy.prototype.hideNotification = notification.hide;


/**
 * Expose function to to reply to a notifiation
 */

UserJoy.prototype.replyNotification = notification.reply;


/**
 * Expose function to show conversation box
 */

UserJoy.prototype.showFeedback = message.show;


/**
 * Expose function to hide conversation box
 */

UserJoy.prototype.hideFeedback = message.hide;


/**
 * Expose function to send new conversation
 */

UserJoy.prototype.sendConversation = message.send;
