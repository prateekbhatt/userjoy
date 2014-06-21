/**
 * Config settings spanning across all apps
 */

var path = require('path');
var _ = require('lodash');

var ENVIRONMENTS = ['development', 'production', 'test'];

var BASE_URLS = {
  development: 'do.localhost',
  production: 'dodatado.com',
  test: 'do.localhost'
};

var PORTS = {
  website: 8000,
  dashboard: 8001,
  api: 8002,
  workers: 8003
};

var DATABASES = {
  development: "dodatado-api-dev",
  production: "dodatado",
  test: "dodatado-api-test"
};

var API_CORS_WHITELIST = {
  development: ['http://app.do.localhost', 'http://do.localhost'],
  production: ['app.dodatado.com', 'dodatado.com'],
  test: ['http://app.do.localhost', 'http://do.localhost']
};

/**
 * Get top-level domain
 * @param  {String} env
 * @return {String}     domain url
 */
function getBaseUrl(env) {
  return BASE_URLS[env];
}

/**
 * Get port on which app should be run
 * @param  {String} appName name of the application
 * @return {Number}         port number
 */
function getPort(appName) {
  return PORTS[appName];
}

/**
 * Get hostnames of all apps
 * e.g., in production environment:
 * dashboard: app.dodatado.com
 */
function getHosts(url) {
  var hosts = {
    website: 'http://' + url,
    dashboard: 'http://' + 'app.' + url,
    api: 'http://' + 'api.' + url,
    cdn: 'http://' + 'cdn.' + url
  };
  return hosts;
}

/**
 * Get MongoDB path
 * @param  {string} env environment
 * @return {string}     database path
 */
function getDbPath(env) {
  var dbPath = "mongodb://localhost/" + DATABASES[env];
  return dbPath;
}

/**
 * Gets array of domains whitelisted by api for cors requests
 * @param {string} env
 * @return {array} whitelist
 */
function getCorsWhitelist(env) {
  return API_CORS_WHITELIST[env];
}

/**
 * Gets base cookie domain
 * @param  {string} env
 * @return {string}     cookie domain
 */
function getCookieDomain(env) {
  return '.'.concat(getBaseUrl(env));
}

/**
 * Get general config settings for all apps
 * @param  {string} appName name of the application
 * @return {object}         config settings object
 */
module.exports = function (appName) {

  var env = process.env.NODE_ENV;

  if (!_.contains(ENVIRONMENTS, env)) {
    throw new Error(env, "environment is not supported");
  }

  var config = {};

  config.environment = env;
  config.port = getPort(appName);
  config.baseUrl = getBaseUrl(env);
  config.hosts = getHosts(config.baseUrl);
  config.appUrl = config.hosts[appName];
  config.dbPath = getDbPath(env);
  config.corsWhitelist = getCorsWhitelist(env);
  config.cookieDomain = getCookieDomain(env);

  return config;

};
