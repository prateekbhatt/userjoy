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
    '$location', '$log', 'LoggedInAppService', '$http', 'config',
    function ($scope, AuthService, LoginService, $location, $log,
        LoggedInAppService, $http, config) {
        $scope.loggedIn = false;

        $scope.showDropdown = function () {
            $scope.visibleDropdown = true;
        };

        $scope.showDropdownApp = function () {
            $scope.visibleDropdownApp = true;
        }

        var appsconnected;
        $scope.apps = [];  

        /*$scope.apps = LoggedInAppService.getLoggedInApps();
        console.log("navbar apps: ", $scope.apps);*/



        /*var loggedInapps = LoggedInAppService.getLoggedInApps();
        console.log(loggedInapps);*/
        console.log("apps length: ", $scope.apps.length);

        $scope.logout = function () {
            AuthService.logout();
            $scope.apps = [];
            $location.path('/login');
        };

        $scope.$watch(LoginService.getUserAuthenticated, function () {
            $log.info("Navbar watch", arguments);
            $scope.loggedIn = LoginService.getUserAuthenticated();
        });


        $scope.$watch(LoggedInAppService.getLoggedInApps, function () {
            $log.info("Navbar watch LoggedInAppService", arguments);
            $scope.apps = LoggedInAppService.getLoggedInApps();
            console.log("navbar apps: ", $scope.apps);
            if(LoggedInAppService.getLoggedInApps().length){
                $scope.connectedapps = true;
            } else {
                $scope.connectedapps = false;
            }
            console.log("connectedapps: ", $scope.connectedapps);
        });


        $scope.changeUrl = function () {
            $log.info("inside settings changeUrl");
            $location.path('/settings/profile');
        }
    }
]);