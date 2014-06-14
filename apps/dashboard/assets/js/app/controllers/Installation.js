angular.module('do.install', [])

.config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('onboarding', {
        url: '/onboarding',
        views: {
          "main": {
            templateUrl: '/templates/onboardingAppmodule/installation.onboarding.html',
            controller: 'installOnboardingAppCtrl'
          }
        },
        authenticate: true
      })
      .state('addcode', {
        url: '/apps/:id/addcode',
        views: {
          "main": {
            templateUrl: '/templates/onboardingAppmodule/installation.addcode.html',
            controller: 'installAddcodeAppCtrl'
          }
        },
        authenticate: true
      })

  }
])

.controller('installOnboardingAppCtrl', ['$scope', '$http', 'config', '$state',
  'AppService', '$log', 'AppModel',
  function ($scope, $http, config, $state, AppService, $log, AppModel) {


    $scope.installapp = function () {

      $log.info($scope.name);
      $log.info($scope.url);
      if ($scope.app_form.$valid) {

      } else {
        $scope.submitted = true;
      }

      var data = {
        name: $scope.name,
        url: $scope.url
      };

      AppModel.addNewApp(data);
    }
  }
])

.controller('installAddcodeAppCtrl', ['$scope', '$http', 'AppService',
  '$location', 'CurrentAppService', 'AppModel', '$stateParams', '$rootScope',
  function ($scope, $http, AppService, $location, CurrentAppService, AppModel, $stateParams, $rootScope) {
    CurrentAppService.getCurrentApp()
      .then(function (currentApp) {
        $scope.appId = $stateParams.id;
        var callback = function (err, data) {
          if(err) {
            console.log("error");
            return;
          }
          if(data.isActive) {
            $location.path('/apps/' + $scope.appId + '/users/list');
          } else {
            $rootScope.info = true;
            $rootScope.infoMsgRootScope = 'We have not received any data yet. Please check if the UserJoy Code is installed on your app.' 
          }
        }
        console.log("$scope.appId ---->>>>>", $scope.appId);
        $scope.startTracking = function () {
          AppModel.checkIfActive($scope.appId, callback);
        }

      })
  }
])