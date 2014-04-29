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

.controller('installAddcodeAppCtrl', ['$scope', '$http',
    function ($scope, $http) {

    }
])
