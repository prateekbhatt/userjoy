angular.module('services.InboxMsgService', [])

.service('InboxMsgService', ['$log',

    function ($log) {

        var inboxMsg = [];

        this.setInboxMessage = function (value) {
            console.log("setting inbox msg");
            inboxMsg = value;
        };

        this.getInboxMessage = function () {
            return inboxMsg;
        };

        return this;

    }
])