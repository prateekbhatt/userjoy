angular.module('services.AppService', [])

.service('AppService', ['$log', '$http', '$q', 'config',

    function ($log, $http, $q, config) {

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

        // return {
        //     getCurrentApp: function () {
        //         var defer = $q.defer();
        //         $http.get(config.apiUrl + '/apps')
        //             .success(function (data) {
        //                 defer.resolve(data[0]);
        //             })
        //         return defer.promise;
        //     }
        // }

        this.getCurrentApp = function () {
            return defaultApp;
        }

        return this;

    }
])