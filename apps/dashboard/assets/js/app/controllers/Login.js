angular.module('do.login', [])

.config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('login', {
                url: '/login',
                views: {
                    "main": {
                        templateUrl: '/templates/LoginSignup/login.html',
                        controller: 'LoginCtrl',
                    }
                },
                authenticate: false
            })
            .state('forgotPassword', {
                url: '/forgotPassword',
                views: {
                    "main": {
                        templateUrl: '/templates/LoginSignup/forgotPassword.html',
                        controller: 'forgotPasswordCtrl',
                    }
                },
                authenticate: false
            })

    }
])

.controller('LoginCtrl', ['$scope', 'LoginService', 'AuthService', '$state',
    '$log', 'ErrMsgService',
    function ($scope, LoginService, AuthService, $state, $log,
        ErrMsgService) {

        $log.info('LoginCtrl', LoginService.getUserAuthenticated());
        $scope.errMsg = '';
        $scope.showError = false;
        // If user is logged in send them to home page
        if (LoginService.getUserAuthenticated()) {
            $state.transitionTo('users.list');
        }

        $scope.hideErrorAlert = function () {
            $scope.showError = false;
        }

        // attempt login to your api
        $scope.attemptLogin = function () {

            AuthService.attemptLogin($scope.email, $scope.password);
            $scope.$watch(ErrMsgService.getErrorMessage, function () {
                if (ErrMsgService.getErrorMessage()) {
                    $scope.showError = true;
                    $scope.errMsg = ErrMsgService.getErrorMessage();
                }
            })

        };
    }
])
    .controller('forgotPasswordCtrl', ['$scope',
        function ($scope) {

        }
    ]);