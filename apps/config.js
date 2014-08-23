/**
 * Config settings spanning across all apps
 */

var path = require('path');
var _ = require('lodash');

var ENVIRONMENTS = ['development', 'production', 'test', 'demo'];

var BASE_URLS = {
  development: 'do.localhost',
  production: 'userjoy.co',
  test: 'do.localhost',

  // demo base url is always the main server url
  demo: 'userjoy.co'
};

var PORTS = {
  website: 8000,
  dashboard: 8001,
  api: 8002,
  workers: 8003,
  demo: 8004
};

var DATABASES = {
  development: "mongodb://localhost/userjoy-api-dev",
  production: "mongodb://54.225.236.74/userjoy-api-prod",
  test: "mongodb://localhost/userjoy-api-test",
  demo: "mongodb://localhost/userjoy-api-demo"
};

var API_CORS_WHITELIST = {
  development: [
    'http://app.do.localhost',
    'http://do.localhost'
  ],
  production: [
    'https://app.userjoy.co',
    'https://userjoy.co',
    'https://www.app.userjoy.co',
    'https://www.userjoy.co'
  ],
  test: [
    'http://app.do.localhost',
    'http://do.localhost'
  ],
  demo: [
    'https://demo.userjoy.co',
    'https://userjoy.co',
    'https://www.demo.userjoy.co',
    'https://www.userjoy.co',
    'http://do.localhost',
    'http://www.do.localhost',
    'http://demo.do.localhost',
    'http://www.demo.do.localhost',
  ]
};

var REDIS_HOST = {
  development: 'localhost',
  production: 'uj-session.pb8czn.0001.use1.cache.amazonaws.com',
  test: 'localhost',
  demo: 'localhost'
};

var IRON_IO_TOKEN = {
  development: 'Rfh192ozhicrSZ2R9bDX8uRvOu0',
  production: 'ViY-q4w45Lv-x1-PbusZcueZfB4',
  test: 'RTMooY5zVIhTT1Dxyo_6cEHdmaE'
};

var IRON_IO_PROJECT_ID = {
  development: '536e5455bba6150009000090',
  production: '53aa810f96d68f000500004e',
  test: '53aa82306bfde3000500003c'
};

var INBOUND_MAIL_DOMAIN = {
  development: 'test-mail.userjoy.co',
  production: 'mail.userjoy.co',
  test: 'test-mail.userjoy.co'
};

var MAILGUN_USER = {
  development: 'postmaster@test-mail.userjoy.co',
  production: 'postmaster@mail.userjoy.co',
  test: 'postmaster@test-mail.userjoy.co'
};

var MAILGUN_PASS = {
  development: '55hjroa-rz89',
  production: '5k0o37dg6od7',
  test: '55hjroa-rz89'
};


/**
 * Get hostnames of all apps
 * e.g., in production environment:
 * dashboard: app.userjoy.co
 */
function getHosts(env, url) {

  var protocol = (env !== 'production') ? 'http://' : 'https://';

  var hosts = {
    website: protocol + url,
    dashboard: protocol + 'app.' + url,
    api: protocol + 'api.' + url,
    cdn: protocol + 'cdn.' + url,
    demo: protocol + 'demo.' + url
  };
  return hosts;
}

/**
 * Gets base cookie domain
 * @param  {string} env
 * @return {string}     cookie domain
 */
function getCookieDomain(env) {
  return '.'.concat(BASE_URLS[env]);
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

  var config = {
    baseUrl: BASE_URLS[env],
    corsWhitelist: API_CORS_WHITELIST[env],
    dbPath: DATABASES[env],
    ironioProjectId: IRON_IO_PROJECT_ID[env],
    ironioToken: IRON_IO_TOKEN[env],
    mailgunDomain: INBOUND_MAIL_DOMAIN[env],
    mailgunPass: MAILGUN_PASS[env],
    mailgunUser: MAILGUN_USER[env],
    port: PORTS[appName],
    redisHost: REDIS_HOST[env],
  };

  config.cookieDomain = '.'.concat(config.baseUrl);
  config.hosts = getHosts(env, config.baseUrl);
  config.appUrl = config.hosts[appName];

  return config;

};
