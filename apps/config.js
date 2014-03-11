/**
 * Config settings spanning across all apps
 */

var path = require('path'),
  _ = require('lodash');

/**
 * General config settings for all apps
 * @param  {string} env     environment in which the app is started
 * @param  {string} appName name of the application
 * @return {object}         config settings object
 */
module.exports = function (env, appName) {

  var config = {};

  var ports = {
    website: 8000,
    dashboard: 8001,
    api: 8002
  };

  config.port = ports[appName];

  config.environment = env;

  var baseUrl = {
    development: 'do.localhost',
    production: 'dodatado.com'
  };

  config.baseUrl = baseUrl[env];

  /**
   * Hostnames for each app
   * e.g., in production environment:
   * dashboard: app.dodatado.com
   */
  config.hosts = {};

  (function (url) {

    config.hosts = {
      website: 'http://' + url,
      dashboard: 'http://' + 'app.' + url,
      api: 'http://' + 'api.' + url
    };

  })(config.baseUrl);

  return config;

};
