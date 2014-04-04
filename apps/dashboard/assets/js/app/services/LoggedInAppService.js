angular.module('services.LoggedInAppService', [])

.service('LoggedInAppService', ['$log',

    function ($log) {

        var loggedinApps = {};

        this.setLoggedInApps = function (value) {
            // $log.info('setUserAuthenticated', value);
            loggedinApps = value;
        };

        this.getLoggedInApps = function () {
            // $log.info('getUserAuthenticated', userIsAuthenticated);
            return loggedinApps;
        };

        return this;

    }
])