angular.module('do.login', [])

.config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('login', {
                url: '/login',
                views: {
                    "main": {
                        templateUrl: '/templates/login.html',
                        controller: 'LoginCtrl',
                    }
                }, 
                authenticate: false
            })

    }
])

.controller('LoginCtrl', ['$scope', 'LoginService', 'AuthService', '$state',
    '$log',
    function ($scope, LoginService, AuthService, $state, $log) {

        $log.info('LoginCtrl', LoginService.getUserAuthenticated())

        // If user is logged in send them to home page
        if (LoginService.getUserAuthenticated()) {
            $state.transitionTo('users.list');
        }

        // attempt login to your api
        $scope.attemptLogin = function () {

            AuthService.attemptLogin($scope.email, $scope.password);
            /*$log.info("login success: ", success);
            if (success) {
                $state.transitionTo('users.list');
            }*/
        };
    }
]);