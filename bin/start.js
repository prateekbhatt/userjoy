#!/usr/bin/env node

var shell = require('shelljs'),
  path = require('path'),
  APPS = ["website", "dashboard", "api"],
  ENVS = ['development', 'production'],
  _ = require('lodash');

// set node js environment variable
function setEnv(env) {
  process.env.NODE_ENV = env;
}

module.exports = function (env) {

  if (!_.contains(ENVS, env)) {
    console.error('Provide a valid environment, either "development" or "production"');
    return;
  }

  var APP_DIR = path.join(__dirname, '..', 'apps'),
    i,
    len;

  setEnv(env);

  shell.cd(APP_DIR);

  for (i = 0, len = APPS.length; i < len; i = i + 1) {

    (function (app) {

      shell.cd(app);
      console.log('Running', app, '...');

      var code = shell.exec('pm2 start app.js --name ' + app)
        .code;
      console.log(app, 'is running in', process.env.NODE_ENV);

      if (code !== 0) {
        console.error(app, 'already running. Please restart');
      }

      shell.cd('..');

    }(APPS[i]));
  }
};
