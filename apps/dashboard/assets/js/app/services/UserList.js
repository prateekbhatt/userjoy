angular.module('services.UserList', [])

.service('UserList', ['$log',

    function ($log) {

        var allUsers = [];

        this.setUsers = function (value) {
            allUsers = value;
        };

        this.getUsers = function () {
            return allUsers;
        };

        return this;

    }
])