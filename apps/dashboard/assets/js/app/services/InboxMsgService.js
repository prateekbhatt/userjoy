angular.module('services.InboxMsgService', [])

.service('InboxMsgService', ['$log',

    function ($log) {

        var inboxMsg = [];
        var unreadMsg = [];

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

        return this;

    }
])