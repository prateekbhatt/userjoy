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
  'CurrentAppService', '$timeout', 'AccountModel', 'AppModel',
  function ($scope, LoginService, AuthService, $state, $log,
    ErrMsgService, login, $location, $rootScope, AppService,
    CurrentAppService, $timeout, AccountModel, AppModel) {

    console.log('LoginProvider:', login.getLoggedIn());
    console.log("reached /login");
    $scope.errMsg = '';
    $scope.showError = false;
    $scope.enableLogin = true;
    $scope.signupHref = 'https://userjoy.co/signup';
    if (window.location.href.split('/')[2] == 'app.do.localhost') {
      $scope.signupHref = 'http://do.localhost/signup';
    } else {
      $scope.signupHref = 'https://userjoy.co/signup';
    }
    console.log("$rootScope loggedIn: ", $rootScope.loggedIn, AppService.getCurrentApp());
    if ($rootScope.loggedIn && AppService.getCurrentApp()
      ._id != null && AppService.getCurrentApp()
      .isActive) {
      $location.path('/apps/' + AppService.getCurrentApp()
        ._id + '/users/list');
    }

    if ($rootScope.loggedIn && AppService.getCurrentApp()
      ._id != null && !AppService.getCurrentApp()
      .isActive) {
      $location.path('/apps/' + AppService.getCurrentApp()
        ._id + '/addcode');
    }

    if ($rootScope.loggedIn && AppService.getCurrentApp()
      ._id == null) {
      CurrentAppService.getCurrentApp()
        .then(function (currentApp) {
          // if (currentApp[0].isActive) {
          //   $location.path('/apps/' + currentApp[0]._id + '/users/list');
          // }

          // if (!currentApp[0].isActive) {
          //   $location.path('/apps/' + currentApp[0]._id + '/addcode');
          // }
          AccountModel.get(function (err, acc) {
            if (err) {
              console.log("error");
              return;
            }
            console.log("account ===================: ", acc, AppService
              .getCurrentApp());
            if (acc.defaultApp) {
              var callback = function (err) {
                if (err) {
                  console.log("error");
                  return;
                }

                if (AppService.getCurrentApp()
                  .isActive) {
                  $location.path('/apps/' + AppService.getCurrentApp()
                    ._id + '/users/list');
                } else {
                  $location.path('/apps/' + AppService.getCurrentApp()
                    ._id + '/addcode');
                }
              }
              AppModel.getSingleApp(acc.defaultApp, callback);

            } else {

              console.log("AppService data Auth.js", currentApp);

              var data = {
                defaultApp: currentApp[0]._id
              }
              AccountModel.updateDefaultApp(data, function (err,
                updatedApp) {

                if (err) {
                  console.log("error");
                  return;
                }

                console.log("updated app: ", updatedApp);
                if (AppService.getLoggedInApps()[0].isActive) {
                  $location.path('/apps/' + AppService.getLoggedInApps()[
                    0]._id + '/users/list');
                } else {
                  console.log(
                    "Auth.js redirecting to addcode url");
                  $location.path('/apps/' + AppService.getLoggedInApps()[
                    0]._id + '/addcode');
                }
                AppService.setCurrentApp(AppService.getLoggedInApps()[
                  0]);
                AppService.setAppName(AppService.getLoggedInApps()[
                  0].name);

              });


            }

          })
        })

    }

    $scope.hideErrorAlert = function () {
      $scope.showError = false;
    }



    // attempt login to your api
    $scope.attemptLogin = function () {
      console.log("inside attemptLogin");
      $scope.enableLogin = false;
      AuthService.attemptLogin($scope.email, $scope.password, function (err) {
        $scope.enableLogin = true;
        console.log("enableLogin: ", $scope.enableLogin);
        if (err) {
          console.log("error in signing in");
          console.log(err.error);
          $rootScope.error = true;
          $rootScope.errMsgRootScope = err.error;
          if (err.error === 'EMAIL_NOT_VERIFIED') {
            $rootScope.error = false;
            $rootScope.errMsgRootScope = '';
            $rootScope.errorEmailVerification = true;
            $rootScope.errMsgEmailNotVerified =
              '<span>Email is not Verified. Click <a ng-click="resendEmailVerification()" style="cursor: pointer">here</a> to resend Email</span>';
          }
          // $timeout(function () {
          //   $rootScope.error = false;
          //   $rootScope.errorEmailVerification = false;
          // }, 5000);
        }
      });

      var callback = function (err) {
        if (err) {
          console.log("error");
          $rootScope.errorEmailVerification = false;
          $rootScope.errMsgEmailNotVerified = '';
          $rootScope.error = true;
          $rootScope.errMsgRootScope = 'Error in sending verification email'
          return;
        }
        $rootScope.errMsgRootScope = '';
        $rootScope.error = false;
        $rootScope.errorEmailVerification = false;
        $rootScope.errMsgEmailNotVerified = '';
        $rootScope.success = true;
        $rootScope.successMsgRootScope =
          'Confirmation Email sent to your email id: ' + $scope.email;
        $timeout(function () {
          $rootScope.success = false;
          $rootScope.successMsgRootScope = '';
        }, 5000);
      }

      $scope.resendEmailVerification = function () {
        console.log("inside resend email verification");
        AccountModel.resendEmailVerification($scope.email, callback);
      }

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

.controller('forgotPasswordCtrl', ['$scope', 'AccountModel', '$rootScope',
  '$timeout',
  function ($scope, AccountModel, $rootScope, $timeout) {
    $scope.enableForgotPassword = true;
    var callback = function (err) {
      $scope.enableForgotPassword = true;
      if (err) {
        console.log("error");
        return;
      } else {
        $rootScope.success = true;
        $rootScope.successMsgRootScope =
          'An email has been sent to reset your password';
        $timeout(function () {
          $rootScope.error = false;
        }, 5000);
      }

    }
    $scope.forgotPassword = function () {
      $scope.enableForgotPassword = false;
      AccountModel.forgotPassword($scope.email, callback);
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
