angular.module('services.AppService', [])

.service('AppService', ['$log', '$http', '$q', 'config',

  function ($log, $http, $q, config) {

    var apps = [];
    var defaultApp = {};
    var email = '';
    var appName = '';
    var appId = '';

    this.new = function (newApp) {
      apps.push(newApp);
    };

    this.setLoggedInApps = function (value) {
      // if (value instanceof Array) {
      //     angular.forEach(value, function (app) {
      //         apps.push(app);
      //     });
      // }
      apps = value;
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

    this.setEmail = function (value) {
      email = value;
    }

    this.getEmail = function () {
      return email;
    }

    this.setAppName = function (value) {
      appName = value;
    }

    this.getAppName = function () {
      return appName
    }

    this.setAppId = function (value) {
      appId = value;
    }

    this.getAppId = function () {
      return appId;
    }

    return this;

  }
])