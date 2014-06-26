#!/usr/bin/env node

/**
 * npm dependencies
 */

var _ = require('lodash');
var program = require('commander');
var shell = require('shelljs');


var start = require('./start');
var cowsay = require('./cowsay');


program.version('0.0.1')
  .option('-e, --env <environment>', 'dev/prod environment')
  .option('-a, --app <app-name>', 'api/dashboard/website/workers');


program.on('--help', function() {
  console.log('  Basic Examples:');
  console.log('');
  console.log('    Start apps in dev / prod env :');
  console.log('    $ userjoy start -e dev');
  console.log('    OR');
  console.log('    $ userjoy start -e prod');
  console.log('');
  console.log('    Start a single app in dev / prod env (api/dashboard/website/workers) :');
  console.log('    $ userjoy start -e dev -a api');
  console.log('');
  console.log('    Restart the previous app launched, by name :');
  console.log('    $ userjoy restart api');
  console.log('');
  console.log('    Stop the app :');
  console.log('    $ userjoy stop api');
  console.log('');
  console.log('    Restart the app :');
  console.log('    $ userjoy restart api');
  console.log('');
  console.log('    Stop all apps and kill daemon :');
  console.log('    $ userjoy stop');
  console.log('');
  console.log('    List all apps :');
  console.log('    $ userjoy list');
  console.log('');
  console.log('    Say Hi :');
  console.log('    $ userjoy cowsay MOO');
  console.log('');
  console.log('');
});


// start
program
  .command('start [env] [app]')
  .description('starts one/all app(s)')
  .action(function () {
    var env = program.env;
    var app = program.app;

    start(env, app);
  });


// restart
program
  .command('restart [app]')
  .description('restart specific apps or all apps')
  .action(function (app) {
    app = app || 'all';

    // TODO: check if app is valid

    console.log('Restarting', app, '...');
    shell.exec('pm2 restart ' + app);
  });

// stop
program
  .command('stop [app]')
  .description('stop specific app or all apps')
  .action(function (app) {

    app = app || 'all';

    // TODO: check if app is valid

    console.log('Stopping', app, '...');
    shell.exec('pm2 delete ' + app);
  });

program
  .command('list')
  .description('lists all apps')
  .action(function () {
    shell.exec('pm2 list');
  });

program
  .command('logs [app]')
  .description('logs output to console')
  .action(function (app) {
    app = app || '';
    shell.exec('pm2 logs ' + app);
  });

program
  .command('cowsay [what]')
  .description('NO MOO')
  .action(function (moo) {
    cowsay(moo);
  });

program
  .command('*')
  .action(function (env) {
    console.log('Enter a Valid command');
    console.log('Try "userjoy --help"');
  });

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}
