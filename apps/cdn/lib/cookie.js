var bind = require('bind');
var cookie = require('cookie');
var clone = require('clone');
var debug = require('debug')('uj:cookie');
var defaults = require('defaults');
var topDomain = require('top-domain');


/**
 * Initialize a new `Cookie`.
 */

function Cookie() {

  // TODO: Needs to be updated
  this.aid = window._userjoy_id;

  // all cookies should be prefixed with _uj
  this.cookiePrefix = '_uj';

  this.debug = debug;

  var domain = '.' + topDomain(window.location.href);

  // localhost cookies are special: http://curl.haxx.se/rfc/cookie_spec.html
  if (domain === '.localhost') domain = '';

  this._options = {
    maxage: 31536000000, // default to a year
    path: '/',
    domain: domain
  };
}


/**
 * Set a `key` and `value` in our cookie.
 *
 * @param {String} key
 * @param {Object} value
 * @return {Boolean} saved
 */

Cookie.prototype.set = function (key, value) {
  return cookie(key, value, clone(this._options));
};


/**
 * Get a value from our cookie by `key`.
 *
 * @param {String} key
 * @return {Object} value
 */

Cookie.prototype.get = function (key) {
  return cookie(key);
};


/**
 * Remove a value from our cookie by `key`.
 *
 * @param {String} key
 * @return {Boolean} removed
 */

Cookie.prototype.remove = function (key) {
  cookie(key, null, clone(this._options));
};



//////////////////////////////////////////////
// METHODS ABOVE ARE GENERIC COOKIE GETTER/SETTER/DELETE METHODS
// METHODS BELOW ARE SPECIFIC TO USERJOY SUCH AS GETTER/SETTER FOR AID, UID, CID
//////////////////////////////////////////////



/**
 * Get the cookie name
 *
 * e.g. '_uj.1234567' where '1234567' is the app id
 *
 * @return {String}
 */

Cookie.prototype._name = function () {
  return this.cookiePrefix + '.' + this.aid;
};


/**
 * Gets the uid and the cid from the cookies
 *
 * @return {Object}
 *         @property {String} uid user-id
 *         @property {String} cid company-id
 */

Cookie.prototype._getIds = function () {
  var aid = this.aid;
  var name = this._name(aid);
  var cook = this.get(name);
  var split;
  var ids = {};

  if (cook) {
    split = cook.split('.')
    ids.uid = split[0] || '';
    ids.cid = split[1] || '';
  }

  return ids;
};


/**
 * Sets uid and cid on the cookie
 *
 * @param {Object} ids
 *        @property {String} uid user-id (optional)
 *        @property {String} cid company-id (optional)
 * @return {Boolean}
 */

Cookie.prototype._setIds = function (ids) {

  var aid = this.aid;
  if (!aid) return false;

  ids || (ids = {});
  ids.uid || (ids.uid = '');
  ids.cid || (ids.cid = '');

  var name = this._name(aid);
  var val = ids.uid + '.' + ids.cid;

  return this.set(name, val);
};


/**
 * Get or set uid into / from cookie
 *
 * @param {String} id user-id (optional)
 */

Cookie.prototype.uid = function (uid) {

  this.debug('uid %s', uid);

  var aid = this.aid;

  switch (arguments.length) {
  case 0:
    return this._getUid();
  case 1:
    return this._setUid(uid);
  }
};


/**
 * Gets uid from the cookie
 *
 * @return {String} user-id
 */

Cookie.prototype._getUid = function () {
  var aid = this.aid;
  return this._getIds()['uid'];
};


/**
 * Sets the uid into the cookie without disturbing the company-id
 *
 * @param {String} uid
 * @return {Boolean}
 */

Cookie.prototype._setUid = function (uid) {
  var aid = this.aid;
  var ids = this._getIds();
  ids.uid = uid || ids.uid || '';
  return this._setIds(ids);
};


/**
 * Get or set uid into / from cookie
 *
 * @param {String} id company-id (optional)
 */

Cookie.prototype.cid = function (cid) {
  var aid = this.aid;

  switch (arguments.length) {
  case 0:
    return this._getCid();
  case 1:
    return this._setCid(cid);
  }
};


/**
 * Gets cid from the cookie
 *
 * @return {String} company-id
 */

Cookie.prototype._getCid = function () {
  var aid = this.aid;
  return this._getIds()['cid'];
};


/**
 * Sets the cid into the cookie without disturbing the company-id
 *
 * @param {String} cid
 * @return {Boolean}
 */

Cookie.prototype._setCid = function (cid) {
  var ids = this._getIds();
  ids.cid = cid || ids.cid || '';
  return this._setIds(ids);
};


/**
 * Expose the cookie singleton.
 */

module.exports = bind.all(new Cookie());


/**
 * Expose the `Cookie` constructor.
 */

module.exports.Cookie = Cookie;
