angular.module('services.ThreadService', [])

.service('ThreadService', ['$log',

  function ($log) {

    var threadMsg = [];
    var reply = [];

    this.setThread = function (value) {
      console.log("setting thread conversation");
      threadMsg = value;
    };

    this.getThread = function () {
      return threadMsg;
    };

    this.setReply = function (value) {
      reply = value;
    }

    this.getReply = function (value) {
      return reply;
    }

    return this;

  }
])