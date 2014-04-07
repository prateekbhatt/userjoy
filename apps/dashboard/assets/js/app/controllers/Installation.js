angular.module('do.install', [])

.config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('onboarding', {
                url: '/onboarding',
                views: {
                    "main": {
                        templateUrl: '/templates/installation.onboarding.html',
                        controller: 'installOnboardingAppCtrl',
                    }
                },
                authenticate: true
            })
            .state('addcode', {
                url: '/addcode',
                views: {
                    "main": {
                        templateUrl: '/templates/installation.addcode.html',
                        controller: 'installAddcodeAppCtrl',
                    }
                },
                authenticate: true
            })

    }
])

.controller('installOnboardingAppCtrl', ['$scope', '$http', 'config', '$state',
    function ($scope, $http, config, $state) {


        $scope.installapp = function () {

            if ($scope.app_form.$valid) {

            } else {
                $scope.submitted = true;
            }

            var data = {
                name: $scope.name,
                domain: $scope.domain
            };

            $http
                .post(config.apiUrl + '/apps', data)
                .success(function (data) {
                    $state.transitionTo('addcode');
                })
        }
    }
])

.controller('installAddcodeAppCtrl', ['$scope', '$http',
    function ($scope, $http) {

    }
])