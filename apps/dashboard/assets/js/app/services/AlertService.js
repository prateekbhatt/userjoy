angular.module('services.AlertService', [])

.service('AlertService', ['$log',
  function ($log) {
    var singleAlert = {};

    this.getSingleAlert = function () {
      return singleAlert;
    };

    this.setSingleAlert = function (alert) {
      singleAlert = alert;
    };
  }
])
