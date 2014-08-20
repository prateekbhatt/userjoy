var _ = require('lodash');
var winston = require('winston');

// Set up logger
var customColors = {
  trace: 'cyan',
  debug: 'blue',
  info: 'green',
  warn: 'yellow',
  crit: 'red',
  fatal: 'bold red'
};

var logger = new(winston.Logger)({
  colors: customColors,
  levels: {
    trace: 0,
    debug: 1,
    info: 2,
    warn: 3,
    crit: 4,
    fatal: 5
  },

  transports: [
    new(winston.transports.Console)({
      level: 'trace', // TODO: should be defined according to the environment inside config.js
      colorize: true,
      timestamp: true
    })
  ]
});

winston.addColors(customColors);

// Extend logger object to properly log 'Error' types
var origLog = logger.log;

logger.log = function (level, msg, metadata) {
  var objType = Object.prototype.toString.call(msg);
  if (objType === '[object Error]') {
    origLog.call(logger, level, msg.toString());
  } else {
    origLog.call(logger, level, msg, metadata || '');
  }
};


module.exports = logger;
