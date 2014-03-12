/**
 * Config settings spanning across all apps
 */

var path = require('path'),
  _ = require('lodash'),

  BASE_URLS = {
    development: 'do.localhost',
    production: 'dodatado.com'
  },

  PORTS = {
    website: 8000,
    dashboard: 8001,
    api: 8002
  };

function getBaseUrl(env) {
  return BASE_URLS[env];
}

function getPort(appName) {
  return PORTS[appName];
}

/**
 * Hostnames for each app
 * e.g., in production environment:
 * dashboard: app.dodatado.com
 */
function getHosts(url) {
  var hosts = {
    website: 'http://' + url,
    dashboard: 'http://' + 'app.' + url,
    api: 'http://' + 'api.' + url
  };
  return hosts;
}

/**
 * General config settings for all apps
 * @param  {string} env     environment in which the app is started
 * @param  {string} appName name of the application
 * @return {object}         config settings object
 */
module.exports = function (env, appName) {

  var config = {};

  config.environment = env;
  config.port = getPort(appName);
  config.baseUrl = getBaseUrl(env);
  config.hosts = getHosts(config.baseUrl);
  config.appUrl = config.hosts[appName];

  return config;

};
