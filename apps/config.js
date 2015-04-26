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



////// DATABASE CONFIG

var DATABASES = {
  development: "mongodb://localhost/userjoy-api-dev",
  production: "mongodb://localhost/userjoy-api-prod", // REPLACE WITH YOUR PRODUCTION DB URL
  test: "mongodb://localhost/userjoy-api-test",
  demo: "mongodb://localhost/userjoy-api-demo"
};




var API_CORS_WHITELIST = {
  development: [
    'http://app.do.localhost',
    'http://do.localhost'
  ],


  // CHECK: REPLACE THE FOLLOWING WITH YOUR CONFIG BEFORE RUNNING
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
    'http://app.do.localhost',
    'http://www.app.do.localhost',
    'https://app.userjoy.co',
    'https://www.app.userjoy.co'

  ]
};


////// IRON IO SETTINGS //////

var IRON_IO_TOKEN = {
  development: 'REPLACE_THIS',
  production: 'REPLACE_THIS',
  test: 'REPLACE_THIS'
};

var IRON_IO_PROJECT_ID = {
  development: 'REPLACE_THIS',
  production: 'REPLACE_THIS',
  test: 'REPLACE_THIS'
};


////// MAILGUN SETTINGS

// CHECK: REPLACE THE FOLLOWING WITH YOUR CONFIG BEFORE RUNNING
var INBOUND_MAIL_DOMAIN = {
  development: 'test-mail.userjoy.co',
  production: 'mail.userjoy.co',
  test: 'test-mail.userjoy.co'
};


// CHECK: REPLACE THE FOLLOWING WITH YOUR CONFIG BEFORE RUNNING
var MAILGUN_USER = {
  development: 'postmaster@test-mail.userjoy.co',
  production: 'postmaster@mail.userjoy.co',
  test: 'postmaster@test-mail.userjoy.co'
};

var MAILGUN_PASS = {
  development: 'REPLACE_THIS',
  production: 'REPLACE_THIS',
  test: 'REPLACE_THIS'
};


////// AWS SETTINGS ///////

var AWS_KEY = 'REPLACE_THIS';
var AWS_SECRET = 'REPLACE_THIS';
var AWS_CLOUDFRONT_DISTRIBUTION_ID = 'REPLACE_THIS';
var AWS_S3_CDN_BUCKET = 'cdn.userjoy.co'; // REPLACE THIS WITH S3 BUCKET ASSOCIATED WITH YOUR CLOUDFRONT DISTRIBUTION



////// SESSION SETTINGS (REDIS)

var SESSION_SECRET = '123456789';
var SESSION_KEY = 'userjoy.sid';

var REDIS_HOST = {
  development: 'localhost',
  production: 'localhost', // REPLACE WITH YOUR PRODUCTION REDIS HOSTING URL
  test: 'localhost',
  demo: 'localhost'
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
    sessionSecret: SESSION_SECRET,
    sessionKey: SESSION_KEY,
    awsKey: AWS_KEY,
    awsSecret: AWS_SECRET,
    awsCloudfrontDistributionId: AWS_CLOUDFRONT_DISTRIBUTION_ID,
    awsS3CDNBucket: AWS_S3_CDN_BUCKET
  };

  config.cookieDomain = '.'.concat(config.baseUrl);
  config.hosts = getHosts(env, config.baseUrl);
  config.appUrl = config.hosts[appName];

  return config;

};
