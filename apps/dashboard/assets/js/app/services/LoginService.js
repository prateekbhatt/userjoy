angular.module('services.LoginService', [])

.service('LoginService', ['$log',

    function ($log) {

        var userIsAuthenticated = false;

        this.setUserAuthenticated = function (value) {
            // $log.info('setUserAuthenticated', value);
            userIsAuthenticated = value;
        };

        this.getUserAuthenticated = function () {
            // $log.info('getUserAuthenticated', userIsAuthenticated);
            return userIsAuthenticated;
        };

        return this;

    }
])