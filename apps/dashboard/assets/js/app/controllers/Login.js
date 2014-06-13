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
    // .state('signup', {
    //     url: '/signup',
    //     views: {
    //         "main": {
    //             templateUrl: '/templates/LoginSignup/signup.html',
    //             controller: 'signupCtrl',
    //         }
    //     },
    //     authenticate: false
    // })

  }
])

.controller('LoginCtrl', ['$scope', 'LoginService', 'AuthService', '$state',
  '$log', 'ErrMsgService', 'login', '$location', '$rootScope', 'AppService',
  'CurrentAppService',
  function ($scope, LoginService, AuthService, $state, $log,
    ErrMsgService, login, $location, $rootScope, AppService,
    CurrentAppService) {

    console.log('LoginProvider:', login.getLoggedIn());
    $scope.errMsg = '';
    $scope.showError = false;
    console.log("$rootScope loggedIn: ", $rootScope.loggedIn);
    if ($rootScope.loggedIn && AppService.getCurrentApp()
      ._id != null) {
      $location.path('/apps/' + AppService.getCurrentApp()
        ._id + '/users/list');
    }

    if ($rootScope.loggedIn && AppService.getCurrentApp()
      ._id == null) {
      CurrentAppService.getCurrentApp()
        .then(function (currentApp) {
          $location.path('/apps/' + currentApp[0]._id + '/users/list');
        })
    }

    $scope.hideErrorAlert = function () {
      $scope.showError = false;
    }

    // attempt login to your api
    $scope.attemptLogin = function () {

      AuthService.attemptLogin($scope.email, $scope.password);
      $scope.$watch(ErrMsgService.getErrorMessage, function () {
        if (ErrMsgService.getErrorMessage()) {
          console.log("err msg: ", ErrMsgService.getErrorMessage());
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

// .controller('signupCtrl', ['$scope',
//     function ($scope) {

//     }
// ]);