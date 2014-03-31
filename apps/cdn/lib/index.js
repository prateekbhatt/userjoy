var DoDataDo = require('./dodatado');


/**
 * Expose the `dodatado` singleton.
 */

var dodatado = module.exports = exports = new DoDataDo();

/**
 * Expose require
 */

dodatado.require = require;

/**
 * Expose `VERSION`.
 */

exports.VERSION = '1.0.0';

/**
 * Initialize
 */

dodatado.initialize();
