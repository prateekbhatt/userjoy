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
  'CurrentAppService', '$rootScope', '$timeout', 'AppModel',
  function ($scope, AuthService, LoginService, $location, $log,
    AppService, $http, config, CurrentAppService, $rootScope, $timeout,
    AppModel
  ) {

    CurrentAppService.getCurrentApp()
      .then(function (currentApp) {

        $scope.loggedIn = false;
        $scope.isActive = false;


        $scope.isActive = function (path) {
          var location = $location.path()
            .split('/')[3];
          return path === location;
        }

        $scope.isAccountActive = function (path) {
          return path === $location.path();
        }

        $scope.showDropdown = function () {
          $scope.visibleDropdown = true;
        };
        $scope.showDropdownApp = function () {
          $scope.visibleDropdownApp = true;
        }

        var appsconnected;
        $scope.apps = [];

        console.log("error: ", $rootScope.error, $rootScope.errMsg,
          $rootScope.loggedIn);
        console.log("apps length: ", $scope.apps.length);

        $scope.logout = function () {
          AuthService.logout();
          $scope.apps = [];
          $location.path('/login');
        };

        $scope.appId = AppService.getCurrentApp()
          ._id;
        if ($scope.appId == null && currentApp[0] != null) {
          $scope.appId = currentApp[0]._id;
        }
        console.log("current App Id ------>>>>>>>..", $scope.appId,
          AppService.getCurrentApp()
          ._id);


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
            $scope.apps.push(AppService.getLoggedInApps()[
              i]);
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
          if (app.isActive) {
            AppService.setCurrentApp(app);
            $location.path('/apps/' + AppService.getCurrentApp()
              ._id + '/users/list');
          } else {
            $location.path('/apps/' + app._id + '/addcode');
          }
        }

        $scope.goToSettings = function (app) {
          if(app.isActive) {
            AppService.setCurrentApp(app);
            $location.path('/apps/' + AppService.getCurrentApp()
              ._id + '/settings/general');
          } else {
            $location.path('/apps/' + app._id + '/addcode');
          }
        }

        $scope.changeUrl = function () {
          $log.info("inside settings changeUrl");
          $location.path('/settings/profile');
        }

        $scope.redirectToApp = function () {
          console.log("currentApp: ", AppService.getCurrentApp(), $scope.appId);
          if (_.isEmpty(AppService.getCurrentApp())) {
            var cb = function (err) {
              if (err) {
                console.log("error");
                return;
              }
              if (AppService.getCurrentApp()
                .isActive) {
                $location.path('/apps/' + $scope.appId + '/users/list');
              } else {
                $location.path('/apps/' + $scope.appId + '/addcode');
              }
            }
            AppModel.getSingleApp($scope.appId, cb);
          } else {
            if (AppService.getCurrentApp()
              .isActive) {
              $location.path('/apps/' + $scope.appId + '/users/list');
            } else {
              $location.path('/apps/' + $scope.appId + '/addcode');
            }
          }
        }
      })

    // 
  }
])

.controller('navbarInstallationCtrl', ['$scope', 'AuthService', '$location',
  'LoginService', 'AppService', '$log', 'CurrentAppService', 'AppModel',
  function ($scope, AuthService, $location, LoginService, AppService, $log,
    CurrentAppService, AppModel) {

    CurrentAppService.getCurrentApp()
      .then(function (currentApp) {
        $scope.showDropdown = function () {
          $scope.visibleDropdown = true;
        }

        $scope.logout = function () {
          AuthService.logout();
        };

        $scope.showDropdownApp = function () {
          $scope.visibleDropdownApp = true;
        }

        var appsconnected;
        $scope.apps = [];

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
            $scope.apps.push(AppService.getLoggedInApps()[
              i]);
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

        $scope.appId = AppService.getCurrentApp()
          ._id;
        if ($scope.appId == null && currentApp[0] != null) {
          $scope.appId = currentApp[0]._id;
        }

        $scope.changeApp = function (app) {
          if (app.isActive) {
            AppService.setCurrentApp(app);
            $location.path('/apps/' + AppService.getCurrentApp()
              ._id + '/users/list');
          } else {
            $location.path('/apps/' + app._id + '/addcode');
          }
        }

        $scope.goToSettings = function (app) {
          if(app.isActive) {
            AppService.setCurrentApp(app);
            $location.path('/apps/' + AppService.getCurrentApp()
              ._id + '/settings/general');
          } else {
            $location.path('/apps/' + app._id + '/addcode');
          }
        }

        $scope.redirectToApp = function () {
          console.log("currentApp: ", AppService.getCurrentApp(), $scope.appId);
          if (_.isEmpty(AppService.getCurrentApp())) {
            var cb = function (err) {
              if (err) {
                console.log("error");
                return;
              }
              if (AppService.getCurrentApp()
                .isActive) {
                $location.path('/apps/' + AppService.getCurrentApp()._id + '/users/list');
              } else {
                $location.path('/apps/' + AppService.getCurrentApp()._id + '/addcode');
              }
            }
            AppModel.getSingleApp($scope.appId, cb);
          } else {
            if (AppService.getCurrentApp()
              .isActive) {
              $location.path('/apps/' + AppService.getCurrentApp()._id + '/users/list');
            } else {
              $location.path('/apps/' + AppService.getCurrentApp()._id + '/addcode');
            }
          }
        }
      })
  }
])
  .controller('serverErrSuccessCtrl', ['$scope',
    function ($scope) {



    }
  ]);