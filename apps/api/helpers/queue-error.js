/**
 * This module sub classes the Error object to create a QueueError object to
 * identify queue related errors in workers
 */


var util = require('util');

function QueueError(message) {
  Error.call(this);
  this.name = 'QueueError';
  this.message = message;
}

util.inherits(QueueError, Error);

module.exports = QueueError;
