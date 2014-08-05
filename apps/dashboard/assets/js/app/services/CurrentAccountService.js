angular.module('services.CurrentAccountService', [])

.service('CurrentAccountService', ['$log', 'config', '$q', '$http', 'AccountService',

  function ($log, config, $q, $http, AccountService) {

    return {
      getCurrentAccount: function () {
        var defer = $q.defer();
        $http.get(config.apiUrl + '/account')
          .success(function (data) {
            defer.resolve(data);
            AccountService.set(data);
          })
        return defer.promise;
      }
    }

  }
])