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
  'CurrentAppService', '$rootScope', '$timeout',
  function ($scope, AuthService, LoginService, $location, $log,
    AppService, $http, config, CurrentAppService, $rootScope, $timeout
  ) {

    CurrentAppService.getCurrentApp()
      .then(function (currentApp) {

        $scope.loggedIn = false;
        $scope.isActive = false;

        $scope.showDropdown = function () {
          $scope.visibleDropdown = true;
        };

        $scope.isActive = function (path) {
          var location = $location.path()
            .split('/')[3];
          return path === location;
        }

        $scope.isAccountActive = function (path) {
          return path === $location.path();
        }

        $scope.showDropdownApp = function () {
          $scope.visibleDropdownApp = true;
        }

        // $scope.isAccountActive = function (path) {
        //     var location = $location.path('/').split('/')[1];
        //     return path === location;
        // }

        var appsconnected;
        $scope.apps = [];

        console.log("error: ", $rootScope.error, $rootScope.errMsg,
          $rootScope.loggedIn);

        // var callback = function () {
        //   $timeout(function () {
        //     console.log("inside error timeout");
        //     $scope.error = false;
        //     $rootScope.error = false;
        //     $rootScope.errMsg = '';
        //     $scope.errMessage = '';
        //   }, 5000);
        // }

        $scope.$watch($rootScope.errMsg, function () {
          console.log("inside $rootscope.errMsg watch: ",
            $rootScope.errMsg);
          $scope.errMessage = $rootScope.errMsg;
        })

        // $scope.error = function () {
        //     return $rootScope.error;
        // }
        // 
        $scope.$watch($rootScope.error, function () {
          $timeout(function () {
            $scope.error = false;
            $rootScope.error = false;
          }, 5000);
        })

        $timeout(function () {
          $scope.success = false;
          $rootScope.success = false;
        }, 5000);

        $scope.$watch($rootScope.success, function () {
          console.log(
            "success msg is displayed YOYOOYOYOOYOYOY!!!!!!!!!"
          )
          $timeout(function () {
            $scope.success = false;
            $rootScope.success = false;
          }, 5000);
        })

        if ($rootScope.success) {
          console.log(
            "success msg is displayed YOYOOYOYOOYOYOY!!!!!!!!!"
          );
        }

        $scope.error = $rootScope.error;

        // var callback = function () {
        //     $timeout(function(){
        //         $scope.success = false;
        //         $scope.error = false;
        //         $rootScope.success = false;
        //         $rootScope.error = false;
        //     }, 5000);
        // }


        $rootScope.hideError = function (event) {
          event.preventDefault();
          console.log("inside hide error");
          $rootScope.error = false;
          // $scope.error = false;
        }

        $scope.success = $rootScope.success;


        $rootScope.hideSuccess = function (event) {
          event.preventDefault();
          console.log("inside hide success")
          $rootScope.success = false;
          $scope.success = false;
        }

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

        // var errIsVisible = expect(element('.showError').css('display')).toBe('inline');
        // console.log("is Err visible: ", errIsVisible);

        // var successIsVisible = expect(element('.showSuccess').css('display')).toBe('inline');
        // console.log("is Successs visible: ". successIsVisible);

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
])

.controller('navbarInstallationCtrl', ['$scope', 'AuthService', '$location',
  function ($scope, AuthService, $location) {
    $scope.showDropdown = function () {
      $scope.visibleDropdown = true;
    }

    $scope.logout = function () {
      AuthService.logout();
      // $scope.apps = [];
      // $location.path('/login');
    };
  }
]);