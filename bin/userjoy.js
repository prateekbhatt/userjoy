#!/usr/bin/env node

var program = require('commander'),
  shell = require('shelljs'),
  start = require('./start'),
  cowsay = require('./cowsay'),
  _ = require('lodash');

program
  .version('0.0.1');

// start
program
  .command('start [env]')
  .description(
    'starts all apps (env is either "development" or "production")')
  .action(function (env) {
    start(env);
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
