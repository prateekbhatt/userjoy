angular.module('services.InboxMsgService', [])

.service('InboxMsgService', ['$log',

  function ($log) {

    var inboxMsg = [];
    var unreadMsg = [];
    var closedMsg = [];
    var latestConversations = [];

    this.setInboxMessage = function (value) {
      console.log("setting inbox msg");
      inboxMsg = value;
    };

    this.getInboxMessage = function () {
      return inboxMsg;
    };

    this.setUnreadMessage = function (value) {
      unreadMsg = value;
    }

    this.getUnreadMessage = function () {
      return unreadMsg;
    }

    this.setClosedMessage = function (value) {
      closedMsg = value;
    }

    this.getClosedMessage = function () {
      return closedMsg;
    }

    this.setLatestConversations = function (value) {
      latestConversations = value;
    }

    this.getLatestConversations = function () {
      return latestConversations;
    }

    return this;

  }
])