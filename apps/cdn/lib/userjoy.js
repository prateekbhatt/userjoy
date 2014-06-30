var ajax = require('ajax');
var app = require('./app');
var bind = require('bind');
var callback = require('callback');
var canonical = require('canonical');
var clone = require('clone');
var company = require('./company');
var contains = require('contains');
var cookie = require('./cookie');
var debug = require('debug');
var debugUserjoy = debug('uj:userjoy');
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



// Change while testing in localhost
// Grunt replace is used to change this api url from 'api.do.localhost' to
// 'api.userjoy.co' in production and vice-versa
// Two grunt tasks have been defined for this: build and buildDev
var API_URL = 'http://api.userjoy.co/track';



/**
 * Expose `UserJoy`.
 */

module.exports = UserJoy;


/**
 * Initialize a new `UserJoy` instance.
 */

function UserJoy() {
  this.debug = debugUserjoy;

  this._timeout = 200;
  app.identify({
    apiUrl: API_URL,
    TRACK_URL: API_URL,
    IDENTIFY_URL: API_URL + '/identify',
    COMPANY_URL: API_URL + '/company',
    NOTIFICATION_FETCH_URL: API_URL + '/notifications',
    CONVERSATION_URL: API_URL + '/conversations'
  });

  bind.all(this);
}


/**
 * Initialize.
 *
 * @return {UserJoy}
 */

UserJoy.prototype.initialize = function () {
  this.debug('initializing ...');

  var self = this;
  var app_id = window._userjoy_id;

  if (!app_id) {
    self.debug(
      'Error: Please provide valid APP_KEY in window.userjoy.load("APP_KEY")');
    self.debug('Error in initializing');
    return;
  }

  // set app_id trait
  app.setTrait('app_id', app_id);


  // set tasks which were queued before initialization
  queue
    .create(window.userjoy)
    .prioritize();

  // enable autotracking forms and links after queue has been created
  this._autoTrackForms();
  this._autoTrackLinks();

  // invoke queued tasks after autotracking has been enabled
  this._invokeQueue();




  notification.load(function (err) {

    if (err) {
      self.debug('Error while initializing: %o', err);
    }

    // load css styles for message
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
  var appTraits = app.traits();
  var app_id = appTraits.app_id;
  var IDENTIFY_URL = appTraits.IDENTIFY_URL;


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
    app_id: app_id,
    user: user.traits()
  };

  ajax({
    type: 'GET',
    url: IDENTIFY_URL,
    data: data,
    success: function (ids) {
      self.debug("identify success: %o", ids);
      ids || (ids = {});
      is.string(ids) && (ids = json.parse(ids));

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
  var appTraits = app.traits();
  var app_id = appTraits.app_id;
  var COMPANY_URL = appTraits.COMPANY_URL;

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

  // if no uid, do not send
  if (!uid) {
    self.debug('Cannot identify company without identifying user');
    return;
  }

  var data = {
    app_id: app_id,
    u: uid,
    company: company.traits()
  };

  ajax({
    type: 'GET',
    url: COMPANY_URL,
    data: data,
    success: function (ids) {
      self.debug("company success: %o", ids);
      ids || (ids = {});
      is.string(ids) && (ids = json.parse(ids));

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
 * @param {String} type of event (link/form/track)
 * @param {String} name of event
 * @param {String} name of module
 * @param {Object} additional properties of event (optional)
 * @return {UserJoy}
 * @api private
 */

UserJoy.prototype._sendEvent = function (type, name, module, properties) {

  var self = this;

  var appTraits = app.traits();
  var app_id = appTraits.app_id;
  var TRACK_URL = appTraits.TRACK_URL;

  // fetch from cookies
  var uid = cookie.uid();
  var cid = cookie.cid();

  // Validations

  // if no uid, do not send
  if (!uid) {
    self.debug('Cannot send event without identifying user');
    return;
  }


  var data = {
    app_id: app_id,
    e: {
      type: type,
      name: name,
    },
    u: uid
  };

  if (cid) data.c = cid;

  if (module) data.e.module = module;
  if (properties) data.e.meta = properties;

  self.debug('Sending new event: %o', data);

  ajax({
    type: 'GET',
    url: TRACK_URL,
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
 * Toggle debug mode.
 */

UserJoy.prototype.toggleDebug = function () {
  var all = 'uj:*';

  if (debug.enabled(all)) {
    debug.disable(all);
  } else {
    debug.enable(all);
  }

};


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


UserJoy.prototype._autoTrackForms = function () {

  var self = this;
  var allForms = document.getElementsByTagName('form');

  each(allForms, function (f) {
    var identifier = f.id;
    var manuallyTracked = false;

    // if no id, return
    if (!identifier) return;

    // app should not have enabled manual tracking of id (check from queue)
    each(queue.tasks, function (t) {

      if (t[0] === 'track_form') {

        // if its an array of form ids, and the array contains this id, then
        // it is being manually tracked
        if (is.array(t[1]) && contains(t[1], identifier)) {
          manuallyTracked = true;
        }

        // if its a single form id (string), and equals the current form id,
        // then it is being manually tracked
        if (is.string(t[1]) && (t[1] === identifier)) {
          manuallyTracked = true;
        }

      }
    });

    // if manually tracked, move on (do not autotrack)
    if (manuallyTracked) return;

    // else enable auto tracking, and pass name as the identifier
    self.track_form(identifier, identifier);


  });

  return this;
}


UserJoy.prototype._autoTrackLinks = function () {

  var self = this;
  var allLinks = document.getElementsByTagName('a');

  each(allLinks, function (l) {
    var identifier = l.id;
    var manuallyTracked = false;

    // if no id, do not track
    if (!identifier) return;

    // app should not have enabled manual tracking of id (check from queue)
    each(queue.tasks, function (t) {

      if (t[0] === 'track_link') {

        // if its an array of link ids, and the array contains this id, then
        // it is being manually tracked
        if (is.array(t[1]) && contains(t[1], identifier)) {
          manuallyTracked = true;
        }

        // if its a single link id (string), and equals the current link id,
        // then it is being manually tracked
        if (is.string(t[1]) && (t[1] === identifier)) {
          manuallyTracked = true;
        }

      }
    });


    // if manually tracked, move on (do not autotrack)
    if (manuallyTracked) return;

    // else enable auto tracking, and pass name as the identifier
    self.track_link(identifier, identifier);


  });

  return this;
}
