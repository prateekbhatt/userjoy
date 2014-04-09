angular.module('services.LoggedInAppService', [])

.service('LoggedInAppService', ['$log',

    function ($log) {

        var apps = [];

        this.new = function (newApp) {
            apps.push(newApp);
        };

        this.setLoggedInApps = function (apps) {
            if (apps instanceof Array) {
                angular.forEach(apps, function (app) {
                    apps.push(app);
                });
            }
        };

        this.getLoggedInApps = function () {
            return apps;
        };

        return this;

    }
])