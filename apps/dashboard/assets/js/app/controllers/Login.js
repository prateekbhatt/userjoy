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
        url: '/forgot-password',
        views: {
          "main": {
            templateUrl: '/templates/LoginSignup/forgotPassword.html',
            controller: 'forgotPasswordCtrl',
          }
        },
        authenticate: false
      })
      .state('setNewPassword', {
        url: '/forgot-password/:id',
        views: {
          "main": {
            templateUrl: '/templates/LoginSignup/setNewPassword.html',
            controller: 'setNewPasswordCtrl',
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
  'CurrentAppService', '$timeout',
  function ($scope, LoginService, AuthService, $state, $log,
    ErrMsgService, login, $location, $rootScope, AppService,
    CurrentAppService, $timeout) {

    console.log('LoginProvider:', login.getLoggedIn());
    $scope.errMsg = '';
    $scope.showError = false;
    $scope.disableLogin = false;
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

    var callback = function (err) {
      $scope.disableLogin = false;
      if (err) {
        console.log("error in signing in");
        console.log(err.error);
        $rootScope.error = true;
        $rootScope.errMsgRootScope = err.error;
        $timeout(function () {
          $rootScope.error = false;
        }, 5000);
      }
    }

    // attempt login to your api
    $scope.attemptLogin = function () {
      $scope.disableLogin = true;
      AuthService.attemptLogin($scope.email, $scope.password, callback);
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

.controller('forgotPasswordCtrl', ['$scope', 'AccountModel',
  function ($scope, AccountModel) {
    $scope.forgotPassword = function () {
      AccountModel.forgotPassword($scope.email);
    }
  }
])

.controller('setNewPasswordCtrl', ['$scope', '$stateParams', 'AccountModel',
  '$rootScope', '$timeout',
  function ($scope, $stateParams, AccountModel, $rootScope, $timeout) {

    var tokenId = $stateParams.id;
    $scope.resetPasswordNew = function () {
      if ($scope.newPassword === $scope.repeatPassword) {
        AccountModel.resetPasswordNew(tokenId, $scope.repeatPassword);
      } else {
        $rootScope.error = true;
        $rootScope.errMsgRootScope = 'The passwords do not match';
        $timeout(function () {
          $rootScope.error = false;
        }, 5000);
      }
    }
  }
]);