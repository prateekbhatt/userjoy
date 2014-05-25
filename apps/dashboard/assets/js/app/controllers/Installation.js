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
                url: '/addcode',
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
    '$location', 'CurrentAppService',
    function ($scope, $http, AppService, $location, CurrentAppService) {
        CurrentAppService.getCurrentApp()
            .then(function (currentApp) {
                if(AppService.getCurrentApp()._id != null) {
                    $scope.appId = AppService.getCurrentApp()
                        ._id;
                    
                } else {
                    $scope.appId = currentApp[0]._id;
                }
                console.log("$scope.appId ---->>>>>", $scope.appId);
                $scope.startTracking = function () {
                    $location.path('/apps/' + $scope.appId + '/users/list');
                }

            })
    }
])