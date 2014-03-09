/**
 * Hosts
 *
 * Hosts are the domains for each of the apps
 * They are defined in the apps/config.js file
 */

var env = process.env.NODE_ENV;
module.exports.hosts = require('../../config').hosts[env];
