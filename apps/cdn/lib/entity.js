var traverse = require('isodate-traverse');
var defaults = require('defaults');
var cookie = require('./cookie');
var extend = require('extend');
var clone = require('clone');


/**
 * Expose `Entity`
 */

module.exports = Entity;


/**
 * Initialize new `Entity` with `options`.
 *
 * @param {Object} options
 */

function Entity(options) {
  this.options(options);
}


/**
 * Get or set storage `options`.
 *
 * @param {Object} options
 *   @property {Object} cookie
 *   @property {Object} localStorage
 */

Entity.prototype.options = function (options) {
  if (arguments.length === 0) return this._options;
  options || (options = {});
  defaults(options, this.defaults || {});
  this._options = options;
};


/**
 * Get or set the entity's `id`.
 *
 * @param {String} id
 */

Entity.prototype.id = function (id) {
  switch (arguments.length) {
  case 0:
    return this._getId();
  case 1:
    return this._setId(id);
  }
};


/**
 * Get the entity's id.
 *
 * @return {String}
 */

Entity.prototype._getId = function () {
  var ret = this._id;
  return ret === undefined ? null : ret;
};


/**
 * Set the entity's `id`.
 *
 * @param {String} id
 */

Entity.prototype._setId = function (id) {
  this._id = id;
};


/**
 * Get or set the entity's `traits`.
 *
 * @param {Object} traits
 */

Entity.prototype.traits = function (traits) {
  switch (arguments.length) {
  case 0:
    return this._getTraits();
  case 1:
    return this._setTraits(traits);
  }
};


/**
 * Get the entity's traits. Always convert ISO date strings into real dates,
 * since they aren't parsed back from local storage.
 *
 * @return {Object}
 */

Entity.prototype._getTraits = function () {
  var ret = this._traits;
  return ret ? traverse(clone(ret)) : {};
};


/**
 * Set the entity's `traits`.
 *
 * @param {Object} traits
 */

Entity.prototype._setTraits = function (traits) {
  traits || (traits = {});
  this._traits = traits;
};


/**
 * Identify the entity with `traits`. If we it's the same entity,
 * extend the existing `traits` instead of overwriting.
 *
 * @param {Object} traits
 */

Entity.prototype.identify = function (traits) {
  traits || (traits = {});
  this.traits(traits);
};


/**
 * Extend the existing `traits` instead of overwriting.
 *
 * @param {String} name
 * @param {String} val
 */

Entity.prototype.setTrait = function (name, val) {
  var traits = this.traits();
  traits[name] = val;
  this.traits(traits);
};


/**
 * Log the entity out, reseting `id` and `traits` to defaults.
 */

Entity.prototype.logout = function () {
  this.id(null);
  this.traits({});
};


/**
 * Reset all entity state, logging out and returning options to defaults.
 */

Entity.prototype.reset = function () {
  this.logout();
  this.options({});
};
