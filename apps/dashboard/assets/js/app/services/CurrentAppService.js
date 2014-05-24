angular.module('services.CurrentAppService', [])

.service('CurrentAppService', ['$log', 'config', '$q', '$http', 'AppService',

    function ($log, config, $q, $http, AppService) {

        return {
            getCurrentApp: function () {
                var defer = $q.defer();
                $http.get(config.apiUrl + '/apps')
                    .success(function (data) {
                        defer.resolve(data);
                        // AppService.setCurrentApp()
                    })
                return defer.promise;
            }
        }

    }
])