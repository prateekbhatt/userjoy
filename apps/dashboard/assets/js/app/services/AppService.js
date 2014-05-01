angular.module('services.AppService', [])

.service('AppService', ['$log',

    function ($log) {

        var apps = [];
        var defaultApp = {};

        this.new = function (newApp) {
            apps.push(newApp);
        };

        this.setLoggedInApps = function (value) {
            if (value instanceof Array) {
                angular.forEach(value, function (app) {
                    apps.push(app);
                });
            }
        };

        this.getLoggedInApps = function () {
            return apps;
        };

        this.setCurrentApp = function (value) {
            defaultApp = value;
        }

        this.getCurrentApp = function () {
            return defaultApp;
        }

        return this;

    }
])
