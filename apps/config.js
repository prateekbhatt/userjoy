/**
 * Config settings spanning across all apps
 */

var path = require('path'),
  _ = require('lodash'),
  config = {};

config.ports = {
  website: 8000,
  dashboard: 8001,
  api: 8002
};

config.baseUrl = {
  development: 'do.localhost',
  production: 'dodatado.com'
};


/**
 * Hostnames for each app
 * e.g., in production environment:
 * dashboard: app.dodatado.com
 */
config.hosts = {};
_.each(config.baseUrl, function (url, env) {

  config.hosts[env] = {
    website: 'http://' + url,
    dashboard: 'http://' +'app.' + url,
    api: 'http://' +'api.' + url
  };

});

module.exports = config;
