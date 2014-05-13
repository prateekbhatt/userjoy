var UserJoy = require('./userjoy');


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
