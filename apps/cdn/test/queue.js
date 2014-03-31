describe('queue', function () {

  var dodatado = window.dodatado;
  var require = dodatado.require;
  var assert = dev('assert');
  var _ = require('lodash');
  var queue = require('./queue');

  it('should set an array tasks', function () {
    assert(_.isArray(queue.tasks));
  });

  describe('#create', function () {

    var tasks;

    beforeEach(function () {
      tasks = [
        ['track', 'reports', 'google analytics'],
        ['identify', 'prateek']
      ];
    });

    it('should create a new queue', function () {
      queue.create(tasks);
      assert(queue.tasks.length === 2);
    });

  });

  describe('#prioritize', function () {

    beforeEach(function () {
      queue.tasks = [
        ['track', 'reports', 'google analytics'],
        ['identify', 'prateek'],
        ['page'],
        ['identify', 'savinay']
      ];
    });

    it('should move identify tasks to the front of the queue', function () {
      assert(queue.tasks[1][0] === 'identify');
      assert(queue.tasks[3][0] === 'identify');
      queue.prioritize();
      assert(queue.tasks[0][0] === 'identify');
      assert(queue.tasks[1][0] === 'identify');
    });

  });

  describe('#_pullIdentify', function () {

    beforeEach(function () {
      queue.tasks = [
        ['track', 'reports', 'google analytics'],
        ['identify', 'prateek']
      ];
    });

    it('should return array identifyTasks', function () {
      var identifyTasks = queue._pullIdentify();
      assert(_.isArray(identifyTasks));
      assert(identifyTasks.length === 1);
      assert(identifyTasks[0][0] === 'identify');
    });

    it('should remove the found tasks from tasks', function () {
      assert(queue.tasks.length === 2);
      queue._pullIdentify();
      // now no more identify tasks should be left in the queue
      assert(queue.tasks.length === 1);
    });

    it('should return empty array if no identifyTasks are present',
      function () {
        queue.tasks = [
          ['track', 'reports', 'google analytics']
        ];
        var identifyTasks = queue._pullIdentify();
        assert(_.isArray(identifyTasks));
        assert(identifyTasks.length === 0);
        assert(queue.tasks.length === 1);
      });
  });

});