
var bind = require('bind');
var debug = require('debug')('uj:user');
var Entity = require('./entity');
var inherit = require('inherit');


/**
 * Initialize a new `User` with `options`.
 *
 * @param {Object} options
 */

function User (options) {
  this.defaults = {};
  this.debug = debug;
  Entity.call(this, options);
}


/**
 * Inherit `Entity`
 */

inherit(User, Entity);


/**
 * Load saved user `id` or `traits` from storage.
 */

User.prototype.load = function () {
  Entity.prototype.load.call(this);
};


/**
 * Expose the user singleton.
 */

module.exports = bind.all(new User());


/**
 * Expose the `User` constructor.
 */

module.exports.User = User;
