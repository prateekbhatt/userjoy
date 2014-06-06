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
var prevent = require('prevent');
var querystring = require('querystring');
var queue = require('./queue');
var size = require('object')
  .length;
var store = require('./store');
var url = require('url');
var user = require('./user');

/**
 * TODO
 *
 * - ASSUME THERE IS ONLY ONE INTEGRATION AND THEN REMOVE UNNECESSARY
 * ABSTRACTION
 * - Remove all facade contructors
 * - In place of facade functions, use constructors in company and user modules
 * - Create new constructors for Alias, Track and Page in the root dir
 * - Update _invoke function to send data
 * - Remove Emitter
 * - Remove all integration related functions
 * - Remove all unused 'components'
 * - Update tests
 *
 *
 * ===================
 * PSEUDO-CODE
 * ===================
 *
 * In initialize, load user and company from storage
 *
 * In invokeQueue, check if identify user / company
 * functions are present in the queue. If yes, invoke these functions
 * before invoking other event-related functions
 *
 * In identify user / company, if unique id is not
 * equal to the id stored in cookie, then reset
 * user / company, and then set new id / traits
 * change entity.prototype.identify function to delete current id / traits
 *
 * Session: create separate session cookie with maxAge of 30 minutes.
 * Every time a new event happens, check if the session exists. If it does
 * not exist, create a new session and pass session related data to the new
 * session. Session should be an entity with its own traits. if there is a
 * valid session id, send it alongwith the request, else the server should
 * create a new session, and send back the session id in the jsonp callback
 *
 */




/**
 * Expose `UserJoy`.
 */

module.exports = UserJoy;


/**
 * Initialize a new `UserJoy` instance.
 */

function UserJoy() {
  this.debug = debug;
  this._timeout = 300;
  this.api_url = '/track';
  this.jsonp_callback = 'foo';
  bind.all(this);
}


/**
 * Initialize with the given `settings` and `options`.
 *
 * @param {Object} settings
 * @param {Object} options (optional)
 * @return {UserJoy}
 */

UserJoy.prototype.initialize = function (settings, options) {

  this.debug('initialize');

  settings = settings || {};
  options = options || {};
  this._options(options);

  // load user now that options are set
  user.load();
  company.load();

  // set tasks which were queued before initialization
  queue
    .create(window.userjoy)
    .prioritize();

  // invoke queued tasks
  this._invokeQueue();

  app.identify({
    app_id: window._userjoy_id,

    // FIXME change before production
    apiUrl: 'http://api.do.localhost/track'
  });

  // FIXME: REMOVE ME
  // this.debug();

  // FIXME: THIS CODE IS NOT TESTED
  notification.load();

  message.load();
  // load css file for message
  message.loadCss();


  // track page view
  this.page();

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

  if (!is.object(traits)) {
    this.debug('err: userjoy.identify must be passed a traits object');
    return;
  }

  // if no user identifier, return
  if (!traits.user_id && !traits.email) {
    self.debug('userjoy.identify must provide the user_id or email');
    return;
  }

  user.identify(traits);

  this._callback(fn);
  return this;
};


/**
 * Return the current user.
 *
 * @return {Object}
 */

UserJoy.prototype.user = function () {
  return user;
};


/**
 * Identify a company by `traits`.
 *
 * @param {Object} traits
 * @param {Function} fn (optional)
 * @return {UserJoy}
 */

UserJoy.prototype.company = function (traits, fn) {

  if (!is.object(traits)) {
    this.debug('err: userjoy.company must be passed a traits object');
    return this;
  }

  company.identify(traits);

  this._callback(fn);
  return this;
};


/**
 * Track an `event` that a user has triggered with optional `properties`.
 *
 * @param {String} event
 * @param {Object} properties (optional)
 * @param {Object} options (optional)
 * @param {Function} fn (optional)
 * @return {UserJoy}
 */

UserJoy.prototype.track = function (event, properties, options, fn) {
  if (is.fn(options)) fn = options, options = null;
  if (is.fn(properties)) fn = properties, options = null, properties = null;

  this._send('track', {
    properties: properties,
    options: options,
    event: event
  });

  this._callback(fn);
  return this;
};


/**
 * Helper method to track an outbound link that would normally navigate away
 * from the page before the analytics calls were sent.
 *
 * @param {Element or Array} links
 * @param {String or Function} event
 * @param {Object or Function} properties (optional)
 * @return {UserJoy}
 */

UserJoy.prototype.trackLink = function (links, event, properties) {
  if (!links) return this;
  if (is.element(links)) links = [links]; // always arrays, handles jquery

  var self = this;
  each(links, function (el) {
    on(el, 'click', function (e) {
      var ev = is.fn(event) ? event(el) : event;
      var props = is.fn(properties) ? properties(el) : properties;
      self.track(ev, props);

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
 * @param {String or Function} event
 * @param {Object or Function} properties (optional)
 * @return {UserJoy}
 */

UserJoy.prototype.trackForm = function (forms, event, properties) {
  if (!forms) return this;
  if (is.element(forms)) forms = [forms]; // always arrays, handles jquery

  var self = this;
  each(forms, function (el) {
    function handler(e) {
      prevent(e);

      var ev = is.fn(event) ? event(el) : event;
      var props = is.fn(properties) ? properties(el) : properties;
      self.track(ev, props);

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
 * Trigger a pageview, labeling the current page with an optional `category`,
 * `name` and `properties`.
 *
 * @param {String} category (optional)
 * @param {String} name (optional)
 * @param {Object or String} properties (or path) (optional)
 * @param {Object} options (optional)
 * @param {Function} fn (optional)
 * @return {UserJoy}
 */

UserJoy.prototype.page = function (category, name, properties, options, fn) {

  if (is.fn(options)) fn = options, options = null;
  if (is.fn(properties)) fn = properties, options = properties = null;
  if (is.fn(name)) fn = name, options = properties = name = null;
  if (is.object(category)) options = name, properties = category, name =
    category = null;
  if (is.object(name)) options = properties, properties = name, name = null;
  if (is.string(category) && !is.string(name)) name = category, category =
    null;

  var defs = {
    path: canonicalPath(),
    referrer: document.referrer,
    title: document.title,
    url: canonicalUrl(),
    search: location.search
  };

  if (name) defs.name = name;
  if (category) defs.category = category;

  properties = clone(properties) || {};
  defaults(properties, defs);

  this._send('page', {
    properties: properties,
    category: category,
    options: options,
    name: name
  });

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
 * Apply options.
 *
 * @param {Object} options
 * @return {UserJoy}
 * @api private
 */

UserJoy.prototype._options = function (options) {
  options = options || {};
  cookie.options(options.cookie);
  store.options(options.localStorage);
  user.options(options.user);
  company.options(options.company);
  return this;
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

UserJoy.prototype._send = function (type, traits) {

  this.debug()

  // TODO: send data to userjoy api here

  var data = {
    event: {
      type: type,
      traits: traits
    },
    user: {
      id: user.id(),
      traits: user.traits()
    }
  };

  if (company.id()) {
    data.company = {
      id: company.id(),
      traits: company.traits()
    };
  }

  this._jsonp(data);
  return this;
};


/**
 * Send data to api using JSON-P
 *
 * @param {Object} data to be sent
 * @return {userjoy}
 */

UserJoy.prototype._jsonp = function (data) {

  function foo(data) {
    // do stuff with JSON
    console.log('recieved foo data', data);
  }

  data.callback = foo;

  data = json.stringify(data);

  // var script = document.createElement('script');

  // script.src = this.api_url +
  //   '?data=' +
  //   data;

  // document.getElementsByTagName('head')[0].appendChild(script);
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
