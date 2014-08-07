angular.module('do.install', [])

.config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('onboarding', {
        url: '/apps/:id/onboarding',
        views: {
          "main": {
            templateUrl: '/templates/onboardingAppmodule/installation.onboarding.html',
            controller: 'installOnboardingAppCtrl'
          }
        },
        authenticate: true
      })
      .state('addcode', {
        url: '/apps/:id/addcode',
        views: {
          "main": {
            templateUrl: '/templates/onboardingAppmodule/installation.addcode.html',
            controller: 'installAddcodeAppCtrl'
          }
        },
        authenticate: true
      })
      .state('inviteteam', {
        url: '/apps/:id/invite',
        views: {
          "main": {
            templateUrl: '/templates/onboardingAppmodule/installation.inviteteam.html',
            controller: 'installInviteTeamAppCtrl'
          }
        },
        authenticate: true
      })
      .state('inviteteamnewapp', {
        url: '/apps/:id/invite/newapp',
        views: {
          "main": {
            templateUrl: '/templates/onboardingAppmodule/installation.inviteteam.newapp.html',
            controller: 'installInviteTeamNewAppCtrl'
          }
        },
        authenticate: true
      })
      .state('sendemail', {
        url: '/apps/:id/sendemail',
        views: {
          "main": {
            templateUrl: '/templates/onboardingAppmodule/installation.sendemail.html',
            controller: 'installSendEmailAppCtrl'
          }
        },
        authenticate: true
      })
      .state('onboardingnewapp', {
        url: '/apps/onboarding/newapp',
        views: {
          "main": {
            templateUrl: '/templates/onboardingAppmodule/installation.onboarding.newapp.html',
            controller: 'installOnboardingNewAppCtrl'
          }
        },
        authenticate: true
      })
      .state('addcodenewapp', {
        url: '/apps/:id/addcode/newapp',
        views: {
          "main": {
            templateUrl: '/templates/onboardingAppmodule/installation.addcode.newapp.html',
            controller: 'installAddcodeNewAppCtrl'
          }
        },
        authenticate: true
      })

  }
])

.controller('installOnboardingAppCtrl', ['$scope', '$http', 'config', '$state',
  'AppService', '$log', 'AppModel', 'AccountService',
  'CurrentAccountService', '$stateParams', '$location',
  function ($scope, $http, config, $state, AppService, $log, AppModel,
    AccountService, CurrentAccountService, $stateParams, $location) {

    CurrentAccountService.getCurrentAccount()
      .then(function (currentAccount) {
        $scope.appId = $stateParams.id;
        AppService.setAppName('Apps');
        console.log("loggedinAccount: ", currentAccount);
        $scope.firstName = currentAccount.name.split(' ')[0].toLowerCase();
        $scope.placeHolderEmail = 'app';
        $scope.$watch('name', function () {
          if ($scope.name) {
            $scope.email = $scope.name.split(' ')
              .join('')
              .toLowerCase();
          }
        })

        $scope.installapp = function () {
          console.log("$scope.name: ", $scope.name);
          if ($scope.app_form.$valid) {

          } else {
            $scope.submitted = true;
          }

          if ($scope.name == null) {
            console.log("$scope.name is empty");
            $rootScope.errMsgRootScope =
              'Enter a valid application name';
            $rootScope.error = true;
            $timeout(function () {
              $rootScope.error = false;
            }, 5000);
            return;
          }

          var data = {
            name: $scope.name,
            subdomain: $scope.email
          };

          AppModel.addNewApp(data, $scope.appId);
        }
      })

  }
])

.controller('installAddcodeAppCtrl', ['$scope', '$http', 'AppService',
  '$location', 'CurrentAppService', 'AppModel', '$stateParams', '$rootScope',
  '$timeout',
  function ($scope, $http, AppService, $location, CurrentAppService,
    AppModel, $stateParams, $rootScope, $timeout) {
    CurrentAppService.getCurrentApp()
      .then(function (currentApp) {
        $scope.appId = $stateParams.id;
        // $scope.codeSnippet = '';

        var populateCode = function (err) {
          if (err) {
            console.log("error");
            return;
          }
          console.log("currentApp: ", AppService.getCurrentApp());
          $scope.apiKey = AppService.getCurrentApp()
            ._id;
          AppService.setAppName(AppService.getCurrentApp()
            .name);
        }

        AppModel.getSingleApp($scope.appId, populateCode)

        var callback = function (err, data) {
          if (err) {
            console.log("error");
            return;
          }
          if (data.isActive) {
            $location.path('/apps/' + $scope.appId + '/onboarding');
          } else {
            $rootScope.info = true;
            $rootScope.infoMsgRootScope =
              'We have not received any data yet. Please check if the UserJoy Code is installed on your app.';
            $timeout(function () {
              $rootScope.info = false;
              $rootScope.infoMsgRootScope = '';
            }, 5000);
          }
        }

        $scope.selectText = function (containerid) {
          if (document.selection) {
            var range = document.body.createTextRange();
            range.moveToElementText(document.getElementById(containerid));
            range.select();
          } else if (window.getSelection) {
            var range = document.createRange();
            range.selectNode(document.getElementById(containerid));
            window.getSelection()
              .addRange(range);
          }
        }

        $scope.sendToDeveloper = function () {
          $location.path('/apps/' + $scope.appId + '/sendemail');
        }

        console.log("$scope.appId ---->>>>>", $scope.appId);
        $scope.startTracking = function () {
          AppModel.checkIfActive($scope.appId, callback);
        }
        console.log("codeSnippet: ", $scope.codeSnippet);
        $scope.getTextToCopy = function () {
          return $scope.codeSnippet;
        }

      })
  }
])

.controller('installInviteTeamAppCtrl', ['$scope', '$stateParams', 'AppModel',
  '$rootScope', '$timeout', '$location',
  function ($scope, $stateParams, AppModel, $rootScope, $timeout, $location) {

    $scope.enableInvite = true;
    $scope.appId = $stateParams.id;
    var emailIds = [];
    $scope.inviteTeamMember = function () {
      console.log("$scope.invitees email: ", $scope.invitees);
      $scope.enableInvite = false;
      for (var i = 0; i < $scope.invitees.length; i++) {
        emailIds[i] = $scope.invitees[i].email;
      };

      console.log("emailIds: ", emailIds);

      var data = {
        emails: emailIds
      };
      console.log("data: ", data);

      var showSuccessMsg = function (err) {
        $scope.enableInvite = true;
        if (err) {
          return err;
        }

        $location.path('/apps/' + $scope.appId + '/users/list');

        // $scope.email = '';
        // $scope.name = '';

        $rootScope.showSuccess = true;
        $rootScope.showSuccessMsgRootScope = 'Invitation sent successfully';
        $timeout(function () {
          $rootScope.showSuccess = false;
        }, 3000);

        // $scope.showMsgSuccess = true;
      }

      AppModel.addNewMember(data, $scope.appId,
        showSuccessMsg);
    }

    $scope.invitees = [{
      email: ''
    }];

    $scope.addAnotherTeamMember = function () {
      $scope.invitees.push({
        email: ''
      });
    }

    $scope.removeTeamMember = function () {
      $scope.invitees.pop();
    }

    $scope.proceedToApp = function () {
      $location.path('/apps/' + $scope.appId + '/users/list');
    }
  }
])

.controller('installInviteTeamAppCtrl', ['$scope', '$stateParams', 'AppModel',
  '$rootScope', '$timeout', '$location',
  function ($scope, $stateParams, AppModel, $rootScope, $timeout, $location) {

    $scope.enableInvite = true;
    $scope.appId = $stateParams.id;
    var emailIds = [];
    $scope.inviteTeamMember = function () {
      console.log("$scope.invitees email: ", $scope.invitees);
      $scope.enableInvite = false;
      for (var i = 0; i < $scope.invitees.length; i++) {
        emailIds[i] = $scope.invitees[i].email;
      };

      console.log("emailIds: ", emailIds);

      var data = {
        emails: emailIds
      };
      console.log("data: ", data);

      var showSuccessMsg = function (err) {
        $scope.enableInvite = true;
        if (err) {
          return err;
        }

        $location.path('/apps/' + $scope.appId + '/users/list');

        // $scope.email = '';
        // $scope.name = '';

        $rootScope.showSuccess = true;
        $rootScope.showSuccessMsgRootScope = 'Invitation sent successfully';
        $timeout(function () {
          $rootScope.showSuccess = false;
        }, 3000);

        // $scope.showMsgSuccess = true;
      }

      AppModel.addNewMember(data, $scope.appId,
        showSuccessMsg);
    }

    $scope.invitees = [{
      email: ''
    }];

    $scope.addAnotherTeamMember = function () {
      $scope.invitees.push({
        email: ''
      });
    }

    $scope.removeTeamMember = function () {
      $scope.invitees.pop();
    }

    $scope.proceedToApp = function () {
      $location.path('/apps/' + $scope.appId + '/users/list');
    }
  }
])

.controller('installSendEmailAppCtrl', ['$scope', '$stateParams', 'AppModel',
  'AccountService', '$location', '$rootScope', '$timeout',
  function ($scope, $stateParams, AppModel, AccountService, $location,
    $rootScope, $timeout) {
    console.log("inside send email ctrl");
    $scope.enableSendEmail = true;
    $scope.appId = $stateParams.id;
    $scope.accountEmail = AccountService.get()
      .email;
    $scope.accountname = AccountService.get()
      .name;
    $scope.userjoyEmail = 'support@userjoy.co';
    var callback = function (err) {
      $scope.enableSendEmail = true;
      if (err) {
        return;
      }
      $rootScope.showSuccess = true;
      $rootScope.showSuccessMsgRootScope =
        'An email has been sent to your developer';
      $timeout(function () {
        $rootScope.showSuccess = false;
        $rootScope.showSuccessMsgRootScope = '';
      }, 5000);
      // $location.path('/apps/' + $scope.appId + '/addcode');
    }
    $scope.sendEmail = function () {
      $scope.enableSendEmail = false;
      AppModel.sendCodeToDeveloper($scope.appId, $scope.toEmail, callback);
    }
  }
])

.controller('installOnboardingNewAppCtrl', ['$scope', '$http', 'config',
  '$state',
  'AppService', '$log', 'AppModel', 'AccountService',
  'CurrentAccountService', '$stateParams', '$location', '$rootScope',
  '$timeout',
  function ($scope, $http, config, $state, AppService, $log, AppModel,
    AccountService, CurrentAccountService, $stateParams, $location,
    $rootScope, $timeout) {

    CurrentAccountService.getCurrentAccount()
      .then(function (currentAccount) {
        // $scope.appId = $stateParams.id;
        AppService.setAppName('Apps');
        console.log("loggedinAccount: ", currentAccount);
        $scope.firstName = currentAccount.name.split(' ')[0].toLowerCase();
        $scope.placeHolderEmail = 'app';
        $scope.$watch('name', function () {
          if ($scope.name) {
            $scope.email = $scope.name.split(' ')
              .join('')
              .toLowerCase();
          }
        })

        // $scope.$watch('email', function () {
        //   if($scope.email.match)
        // })

        $scope.installapp = function () {
          console.log("$scope.name: ", $scope.name);
          if ($scope.app_form.$valid) {

          } else {
            $scope.submitted = true;
          }

          if ($scope.name == null) {
            console.log("$scope.name is empty");
            $rootScope.errMsgRootScope =
              'Enter a valid application name';
            $rootScope.error = true;
            $timeout(function () {
              $rootScope.error = false;
            }, 5000);
            return;
          }

          if ($scope.email.match(/^[a-zA-Z0-9_]*$/g)) {
            var data = {
              name: $scope.name,
              subdomain: $scope.email
            };

            AppModel.addAnotherNewApp(data);

          } else {
            $rootScope.errMsgRootScope =
              'Only alphanumeric characters allowed in the email id';
            $rootScope.error = true;
            $timeout(function () {
              $rootScope.error = false;
            }, 5000);
            return;
          }

        }
      })

  }
])

.controller('installAddcodeNewAppCtrl', ['$scope', '$http', 'AppService',
  '$location', 'CurrentAppService', 'AppModel', '$stateParams', '$rootScope',
  '$timeout',
  function ($scope, $http, AppService, $location, CurrentAppService,
    AppModel, $stateParams, $rootScope, $timeout) {
    CurrentAppService.getCurrentApp()
      .then(function (currentApp) {
        $scope.appId = $stateParams.id;
        // $scope.codeSnippet = '';

        var populateCode = function (err) {
          if (err) {
            console.log("error");
            return;
          }
          console.log("currentApp: ", AppService.getCurrentApp());
          $scope.apiKey = AppService.getCurrentApp()
            ._id;
          AppService.setAppName(AppService.getCurrentApp()
            .name);
        }

        AppModel.getSingleApp($scope.appId, populateCode)

        var callback = function (err, data) {
          if (err) {
            console.log("error");
            return;
          }
          if (data.isActive) {
            $location.path('/apps/' + $scope.appId + '/invite/newapp');
          } else {
            $rootScope.info = true;
            $rootScope.infoMsgRootScope =
              'We have not received any data yet. Please check if the UserJoy Code is installed on your app.';
            $timeout(function () {
              $rootScope.info = false;
              $rootScope.infoMsgRootScope = '';
            }, 5000);
          }
        }

        $scope.selectText = function (containerid) {
          if (document.selection) {
            var range = document.body.createTextRange();
            range.moveToElementText(document.getElementById(containerid));
            range.select();
          } else if (window.getSelection) {
            var range = document.createRange();
            range.selectNode(document.getElementById(containerid));
            window.getSelection()
              .addRange(range);
          }
        }

        $scope.sendToDeveloper = function () {
          $location.path('/apps/' + $scope.appId + '/sendemail');
        }

        console.log("$scope.appId ---->>>>>", $scope.appId);
        $scope.startTracking = function () {
          AppModel.checkIfActiveNewApp($scope.appId, callback);
        }
        console.log("codeSnippet: ", $scope.codeSnippet);
        $scope.getTextToCopy = function () {
          return $scope.codeSnippet;
        }

      })
  }
])
