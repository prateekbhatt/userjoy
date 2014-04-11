angular.module('services.LoginService', [])

.service('LoginService', ['$log',

    function ($log) {

        var userIsAuthenticated = false;

        this.setUserAuthenticated = function (value) {
            userIsAuthenticated = value;
        };

        this.getUserAuthenticated = function () {
            return userIsAuthenticated;
        };

        return this;

    }
])