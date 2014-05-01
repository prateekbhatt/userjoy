angular.module('services.InboxMessagesService', [])

.service('InboxMessagesService', ['$log',

    function ($log) {

        var inboxMsg = [];

        this.setInboxMessage = function (value) {
            inboxMsg = value;
        };

        this.getInboxMessage = function () {
            return inboxMsg;
        };

        return this;

    }
])