#!/usr/bin/env node

/**
 * npm dependencies
 */

var _ = require('lodash');
var path = require('path');
var shell = require('shelljs');


/**
 * Constants
 */

var APPS = ["website", "dashboard", "api", "workers"];
var ENVS = ['dev', 'prod'];


// set node js environment variable
function setEnv(env) {
  process.env.NODE_ENV = env;
}


/**
 * start apps in proper env
 *
 * @param {string} env dev/prod
 * @param {string} app app-name api/dashboard/website/workers (optional)
 */

module.exports = function (env, app) {

  if (!_.contains(ENVS, env)) {
    console.error(
      '\n\tProvide a valid environment, either "-e dev" or "-e prod"\n');
    return;
  }


  if (app && !_.contains(APPS, app)) {
    console.error(
      '\n\tProvide a valid app, api/dashboard/website/workers\n');
    return;
  }

  var APP_DIR = path.join(__dirname, '..', 'apps');
  var i;
  var len;
  var startApps = [];


  setEnv(env);
  shell.cd(APP_DIR);


  if (app) {

    // if app provided, start only that app
    startApps = [app];
  } else {

    // dont start workers by default

    startApps = ['api', 'dashboard', 'website']
  }


  for (i = 0, len = startApps.length; i < len; i = i + 1) {

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

    }(startApps[i]));
  }
};
