angular.module('services.CurrentAppService', [])

.service('CurrentAppService', ['$log', 'config', '$q', '$http',

    function ($log, config, $q, $http) {

        return {
            getCurrentApp: function () {
                var defer = $q.defer();
                $http.get(config.apiUrl + '/apps')
                    .success(function (data) {
                        defer.resolve(data[0]);
                    })
                return defer.promise;
            }
        }

    }
])