angular.module('services.CurrentAppService', [])

.service('CurrentAppService', ['$log', 'config', '$q', '$http', 'AppService',

  function ($log, config, $q, $http, AppService) {

    return {
      getCurrentApp: function () {
        var defer = $q.defer();
        console.log("getting apps");
        $http.get(config.apiUrl + '/apps')
          .success(function (data) {
            defer.resolve(data);
            AppService.setLoggedInApps(data);
          })
        return defer.promise;
      }
    }

  }
])
