var _ = require('lodash');
var bind = require('bind');
var debug = require('debug')('uj:queue');
var each = require('each');
var is = require('is');


/**
 * Expose `queue` singleton
 */

module.exports = bind.all(new Queue());


/**
 * Initialize a new `Queue`
 */

function Queue() {
  this.debug = debug;
  this.tasks = [];
  return this;
}

/**
 * Creates queue based on the tasks in the param array
 *
 * @param {Array} window.userjoy
 * @return {Queue}
 */

Queue.prototype.create = function (arr) {
  if (!is.array(arr)) return this;

  var self = this;
  each(arr, function (task) {
    self.tasks.push(task);
  });

  return this;
};


/**
 * Reorders queue
 * Moves tasks which identify user / group to the front of the queue
 *
 * @return {Queue}
 */

Queue.prototype.prioritize = function () {

  var identifyTasks = this._pullIdentify();

  for (var i = identifyTasks.length - 1; i >= 0; i--) {
    this.tasks.unshift(identifyTasks[i]);
  }

  return this;
};


/**
 * Checks if queue has functions which identify user / group
 * Removes found identify tasks from the queue
 * Sets this.identifyTasks
 *
 * @param {Array} tasks
 * @return {Array} identify tasks
 */

Queue.prototype._pullIdentify = function () {

  var identifyFuncs = ['identify'];

  return _.remove(this.tasks, function (task) {
    return _.contains(identifyFuncs, task[0]);
  });

  return this;
};
