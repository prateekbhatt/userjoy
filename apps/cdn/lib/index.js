var debug = require('debug');
var UserJoy = require('./userjoy');


/**
 * Enable or disable debug.
 *
 * @param {String or Boolean} str
 */

var showDebug = function (str) {
  if (0 == arguments.length || str) {
    debug.enable('uj:' + (str || '*'));
  } else {
    debug.disable();
  }
};


// FIXME REMOVE ME SHOULD BE ENABLED ONLY IN DEVELOPMENT
showDebug();


/**
 * Expose the `userjoy` singleton.
 */

var userjoy = module.exports = exports = new UserJoy();

/**
 * Expose require
 */

userjoy.require = require;

/**
 * Expose `VERSION`.
 */

exports.VERSION = '1.0.0';

/**
 * Initialize
 */

userjoy.initialize();
