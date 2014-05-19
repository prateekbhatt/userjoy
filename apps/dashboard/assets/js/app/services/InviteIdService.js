angular.module('services.InviteIdService', [])

.service('InviteIdService', ['$log',

    function ($log) {

        var inviteId = '';

        this.setInviteId = function (value) {
            inviteId = value;
        };

        this.getInviteId = function () {
            return inviteId;
        };

        return this;

    }
])