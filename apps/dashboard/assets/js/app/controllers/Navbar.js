angular.module('do.navbar', [])

/*.config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider.state('navbar', {
            url: '/',
            views: {
                "navbar": {
                    templateUrl: '/templates/navbar.html',
                    controller: 'NavbarCtrl'
                }
            }
        });
    }
])*/


.controller('NavbarCtrl', ['$scope', 'AuthService', 'LoginService',
    '$location', '$log',
    function ($scope, AuthService, LoginService, $location, $log) {

        $scope.loggedIn = false;

        $scope.showDropdown = function () {
            // console.log("user authentication: ", LoginService.getUserAuthenticated());
            $scope.visibleDropdown = true;
        };

        $scope.logout = function () {
            AuthService.logout();
            $location.path('/login');
        };

        $scope.$watch(LoginService.getUserAuthenticated, function () {
            $log.info("Navbar watch", arguments);
            $scope.loggedIn = LoginService.getUserAuthenticated();
        });
    }
]);