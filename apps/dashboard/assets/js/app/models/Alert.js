angular
  .module('models.alerts', ['services'])
  .service('AlertModel', ['$http', 'config',
    function ($http, config) {
      this.getAllAlerts = function (cb) {
        $http
          .get(config.apiUrl + '/apps/53f6ef3500f528600f2f497d/alerts')
          .success(function (data) {
            console.log("alerts: ", data);
            cb(null, data);
          })
          .error(cb)
      }

      this.createNewAlert = function (appId, alert) {
        $http
          .post(config.apiUrl + '/apps/' + appId + '/alerts', alert)
          .success(function(data) {
            console.log("success");
          })
          .error(function () {
            console.log("error");
          })
      }

      this.getSingleAlert = function (appId, alertId, cb) {
        $http
          .get(config.apiUrl + '/apps/' + appId + '/alerts/' + alertId)
          .success(function (data) {
            console.log("single alert: ", data);
            cb(null, data);
          })
          .error(cb)
      }

    }
  ])
