
var bind = require('bind');
var debug = require('debug')('uj:app');
var Entity = require('./entity');
var inherit = require('inherit');


/**
 * Initialize a new `App` with `options`.
 *
 * @param {Object} options
 */

function App (options) {
  this.defaults = {}
  this.debug = debug;
  Entity.call(this, options);
}


/**
 * Inherit `Entity`
 */

inherit(App, Entity);


/**
 * Load saved app `id` or `traits` from storage.
 */

App.prototype.load = function () {
  Entity.prototype.load.call(this);
};


/**
 * Expose the app singleton.
 */

module.exports = bind.all(new App());


/**
 * Expose the `App` constructor.
 */

module.exports.App = App;
