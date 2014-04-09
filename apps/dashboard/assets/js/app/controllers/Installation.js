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
    'LoggedInAppService', '$log',
    function ($scope, $http, config, $state, LoggedInAppService, $log) {


        $scope.installapp = function () {

            $log.info($scope.name);
            $log.info($scope.domain);
            if ($scope.app_form.$valid) {

            } else {
                $scope.submitted = true;
            }

            var data = {
                name: $scope.name,
                domain: $scope.domain
            };

            var appStack = [];

            $http
                .post(config.apiUrl + '/apps', newApp)
                .success(function (data) {
                    $state.transitionTo('addcode');
                    var finalElement = LoggedInAppService.getLoggedInApps()
                        .length;

                    // AppService.new(newApp);
                    for (var i = LoggedInAppService.getLoggedInApps()
                        .length - 1; i >= 0; i--) {
                        appStack.push(LoggedInAppService.getLoggedInApps()[
                            i]);
                    };
                    appStack.push(newApp);
                    LoggedInAppService.setLoggedInApps(newApp);
                    console.log("apps created: ", LoggedInAppService.getLoggedInApps());
                })
        }
    }
])

.controller('installAddcodeAppCtrl', ['$scope', '$http',
    function ($scope, $http) {

    }
])