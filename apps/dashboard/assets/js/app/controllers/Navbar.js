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
    '$location', '$log', 'AppService', '$http', 'config',
    'CurrentAppService',
    function ($scope, AuthService, LoginService, $location, $log,
        AppService, $http, config, CurrentAppService) {

        CurrentAppService.getCurrentApp()
            .then(function (currentApp) {

                $scope.loggedIn = false;

                $scope.showDropdown = function () {
                    $scope.visibleDropdown = true;
                };

                $scope.showDropdownApp = function () {
                    $scope.visibleDropdownApp = true;
                }

                var appsconnected;
                $scope.apps = [];

                /*$scope.apps = AppService.getLoggedInApps();
            console.log("navbar apps: ", $scope.apps);*/



                /*var loggedInapps = AppService.getLoggedInApps();
            console.log(loggedInapps);*/
                console.log("apps length: ", $scope.apps.length);

                $scope.logout = function () {
                    AuthService.logout();
                    $scope.apps = [];
                    $location.path('/login');
                };

                $scope.appId = AppService.getCurrentApp()
                    ._id;

                $scope.$watch(LoginService.getUserAuthenticated,
                    function () {
                        $log.info("Navbar watch", arguments);
                        $scope.loggedIn = LoginService.getUserAuthenticated();
                    });

                $scope.apps = AppService.getLoggedInApps();

                $scope.$watch(AppService.getLoggedInApps, function () {
                    $log.info("Navbar watch AppService", arguments);
                    $scope.apps = [];
                    for (var i = 0; i < AppService.getLoggedInApps()
                        .length; i++) {
                        $scope.apps.push(AppService.getLoggedInApps()[i]);
                    };
                    console.log("navbar apps: ---->>>>> ", $scope.apps,
                        AppService.getLoggedInApps());
                    if (AppService.getLoggedInApps()
                        .length) {
                        $scope.connectedapps = true;
                    } else {
                        $scope.connectedapps = false;
                    }
                    console.log("connectedapps: ", $scope.connectedapps);
                });

                $scope.changeApp = function (app) {
                    AppService.setCurrentApp(app);
                    $location.path('/apps/' + AppService.getCurrentApp()
                        ._id + '/users/list');
                }

                $scope.goToSettings = function (app) {
                    AppService.setCurrentApp(app);
                    $location.path('/apps/' + AppService.getCurrentApp()
                        ._id + '/settings/general');
                }

                $scope.changeUrl = function () {
                    $log.info("inside settings changeUrl");
                    $location.path('/settings/profile');
                }
            })

        // 
    }
]);