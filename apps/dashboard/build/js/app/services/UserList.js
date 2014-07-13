angular.module('services.UserList', [])

.service('UserList', ['$log',

  function ($log) {

    var allUsers = [];
    var useremail = '';

    this.setUsers = function (value) {
      allUsers = value;
    };

    this.getUsers = function () {
      return allUsers;
    };

    this.setUserEmail = function (value) {
      useremail = value;
    }

    this.getUserEmail = function () {
      return useremail;
    }

    return this;

  }
])