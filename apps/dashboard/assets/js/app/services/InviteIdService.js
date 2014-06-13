angular.module('services.InviteIdService', [])

.service('InviteIdService', ['$log',

  function ($log) {

    var inviteId = '';
    var invitedMembers = [];

    this.setInviteId = function (value) {
      inviteId = value;
    };

    this.getInviteId = function () {
      return inviteId;
    };

    this.setInvitedMembers = function (value) {
      invitedMembers = value;
    }

    this.getInvitedMembers = function () {
      return invitedMembers;
    }

    return this;

  }
])