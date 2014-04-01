angular.module('do.login', [])

.config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('login', {
                url: '/login',
                views: {
                    "main": {
                        templateUrl: '/templates/login.html',
                        controller: 'LoginCtrl'
                    }
                }
            })

    }
])

.controller('LoginCtrl', ['$scope', 'LoginService', 'AuthService', '$location',
    function ($scope, LoginService, AuthService, $location) {
        // If user is logged in send them to home page
        if (AuthService.getUserAuthenticated()) {
            $location.path('/users');
        }

        // attempt login to your api
        $scope.attemptLogin = function () {
            
        var success = LoginService.attemptLogin($scope.email, $scope.password);
        console.log("success", success);
            if (success) {
                AuthService.setUserAuthenticated(true);
                $location.path('/users');
            } else {
                AuthService.setUserAuthenticated(false);
                // you're probably a hacker
            }
       
         

            /*AuthService.setUserAuthenticated(true);
            $location.path('/users');*/
        };
    }
]);