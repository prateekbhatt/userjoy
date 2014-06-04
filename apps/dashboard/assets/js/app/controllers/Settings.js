angular.module('do.settings', [])

.config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('settings', {
        url: '/account',
        views: {
          "main": {
            templateUrl: '/templates/settingsmodule/settings.html',
            controller: 'profileSettingsCtrl'
          }
        },
        authenticate: true
      })
      .state('accountsettings', {
        url: '/account/settings',
        views: {
          "main": {
            templateUrl: '/templates/settingsmodule/settings.profile.html',
            controller: 'profileSettingsCtrl',
          }
        },
        authenticate: true
      })
      .state('changePassword', {
        url: '/account/settings/changePassword',
        views: {
          "main": {
            templateUrl: '/templates/settingsmodule/settings.profile.changePassword.html',
            controller: 'changePasswordCtrl',
          }
        },
        authenticate: true
      })
      .state('appsettings', {
        url: '/apps/:id/settings',
        views: {
          "main": {
            templateUrl: '/templates/settingsmodule/settings.app.html',
            controller: 'appSettingsCtrl',
          }
        },
        authenticate: true
      })
      .state('appsettings.general', {
        url: '/general',
        views: {
          "tab": {
            templateUrl: '/templates/settingsmodule/settings.app.general.html',
            controller: 'appSettingsGeneralCtrl',
          }
        },
        authenticate: true
      })
      .state('appsettings.team', {
        url: '/team',
        views: {
          "tab": {
            templateUrl: '/templates/settingsmodule/settings.app.team.html',
            controller: 'appSettingsTeamCtrl',
          }
        },
        authenticate: true
      })
      .state('appsettings.health', {
        url: '/health',
        views: {
          "tab": {
            templateUrl: '/templates/settingsmodule/settings.app.health.html',
            controller: 'appSettingsHealthCtrl',
          }
        },
        authenticate: true
      })
      .state('appsettings.messages', {
        url: '/messages',
        views: {
          "tab": {
            templateUrl: '/templates/settingsmodule/settings.app.messages.html',
            controller: 'appSettingsMessagesCtrl',
          }
        },
        authenticate: true
      })
      .state('appsettings.environment', {
        url: '/environment',
        views: {
          "tab": {
            templateUrl: '/templates/settingsmodule/settings.app.environment.html',
            controller: 'appSettingsEnvironmentCtrl',
          }
        },
        authenticate: true
      })
      .state('appsettings.billing', {
        url: '/billing',
        views: {
          "tab": {
            templateUrl: '/templates/settingsmodule/settings.app.billing.html',
            controller: 'appSettingsBillingCtrl',
          }
        },
        authenticate: true
      })
      .state('appsettings.installation', {
        url: '/installation',
        views: {
          "tab": {
            templateUrl: '/templates/settingsmodule/settings.app.installation.html',
            controller: 'appSettingsInstallationCtrl',
          }
        },
        authenticate: true
      })
      .state('redirect', {
        url: '/apps/:aid/invite/:id',
        views: {
          "main": {
            templateUrl: '/templates/settingsmodule/settings.redirect.invite.html',
            controller: 'appSettingsInviteCtrl',
          }
        }
      })

  }
])


.controller('profileSettingsCtrl', ['$scope', '$log', '$state', '$location',
  '$http', 'config', 'AccountService', 'AccountModel', 'AppService',
  function ($scope, $log, $state, $location, $http, config,
    AccountService, AccountModel, AppService) {

    $scope.profileNameChangeSuccess = false;
    $scope.profileNameChangeError = false;
    $scope.hideSuccessAlert = function () {
      $scope.profileNameChangeSuccess = false;
    }

    $scope.hideErrorAlert = function () {
      $scope.profileNameChangeError = false;
    }


    function setName() {
      var account = AccountService.get();
      if (typeof account === 'object') {
        $scope.name = account.name;
        console.log("profile name: ", $scope.name, account.name);
      }
    }

    function init() {
      setName();
    }

    $scope.name = '';

    init();

    $scope.$watch(AccountService.get, setName);

    console.log("$location.path: --------->>>> ", $location.path());
    if ($location.path() ===
      '/account') {
      $location.path('/apps/' + AppService.getCurrentApp()
        ._id + '/users/list');
    }

    $scope.changeProfileName = function () {
      console.log("updating profile name");
      AccountModel.updateName($scope.name, function (err, acc) {
        if (err) {
          $log.error('failed to update name', err);
          $scope.profileNameChangeError = true;
          return;
        }
        $scope.profileNameChangeSuccess = true;
        AccountService.set(acc);
      });
    }
  }
])

.controller('changePasswordCtrl', ['$scope', 'AccountModel', '$log',
  function ($scope, AccountModel, $log) {

    // $scope.newPwdLen = true;
    $scope.new_pwd = '';
    $scope.showError = false;
    $scope.pwdChangedSuccess = false;
    $scope.errMsg = '';
    $scope.hideErrorAlert = function () {
      $scope.showError = false;
    }

    $scope.hideSuccessAlert = function () {
      $scope.pwdChangedSuccess = false;
    }
    $scope.changePassword = function () {
      AccountModel.updatePwd($scope.current_pwd, $scope.new_pwd,
        function (err, data) {
          if (err) {
            $log.error('failed to update pwd:', err);
            $scope.showError = true;
            $scope.errMsg = err.error;
            return;
          }
          $scope.pwdChangedSuccess = true;
          $log.info("password changed successfully!");
        })
    }
  }
])

.controller('appSettingsCtrl', ['$scope', '$log', '$state', '$location',
  function ($scope, $log, $state, $location) {

    // TODO: get data from backend
    $scope.App = 'Userjoy';
    // TODO: Change this code. Change window.location.href everywhere to $location.path()
    if (window.location.href ===
      'http://app.do.localhost/app/settings') {
      $location.path('/app/settings/general');
    }

  }
])

.controller('appSettingsGeneralCtrl', ['$scope', '$log', '$state',
  'AppService', 'AppModel', 'CurrentAppService', '$stateParams',
  function ($scope, $log, $state, AppService, AppModel, CurrentAppService,
    $stateParams) {

    CurrentAppService.getCurrentApp()
      .then(function (currentApp) {
        $scope.currApp = $stateParams.id;

        var populatePage = function () {
          $scope.name = AppService.getCurrentApp()
            .name;
          var appId = AppService.getCurrentApp()
            ._id;

          $scope.changeAppName = function () {
            AppModel.updateName($scope.name, appId, function (err, data) {
              if (err) {
                $log.info("Error in updating app name");
                return;
              }
              $log.info("app name changed successfully!")
            })
          }
        }
        AppModel.getSingleApp($scope.currApp, populatePage);
      })

  }
])

.controller('appSettingsTeamCtrl', ['$scope', '$log', '$state',
  'CurrentAppService', 'AppModel', 'InviteModel', 'InviteIdService',
  'AppService', '$stateParams',
  function ($scope, $log, $state, CurrentAppService, AppModel,
    InviteModel, InviteIdService, AppService, $stateParams) {

    // TODO: Get data from backend
    CurrentAppService.getCurrentApp()
      .then(function (currentApp) {

        $scope.currApp = $stateParams.id;
        $scope.invTeamMember = false;
        $scope.showMsgSuccess = false;
        $scope.team = [];
        $scope.invitedTeam = [];

        var populatePage = function () {

          $scope.hideMsgSuccessAlert = function () {
            $scope.showMsgSuccess = false;
          }



          var populateInvitedMembers = function () {
            $scope.invitedTeam = InviteIdService.getInvitedMembers();
            // $scope.showMsgSuccess = true;
          }
          InviteModel.getPendingInvites($scope.currApp,
            populateInvitedMembers);
          // $scope.team = currentApp.team;

          var length = InviteIdService.getInvitedMembers()
            .length;
          $scope.$watch('length', function () {
            $scope.invTeamMember = true;
          })

          for (var i = 0; i < AppService.getCurrentApp()
            .team.length; i++) {
            $scope.team.push({
              name: AppService.getCurrentApp()
                .team[i].accid.name,
              email: AppService.getCurrentApp()
                .team[i].accid.email
            })
          };

          $scope.removeTeamMember = function (teamMember) {
            // TODO: Add code to remove team member
            $log.info(
              "team member removed function called");
            var index = $scope.team.indexOf(teamMember);
            $scope.team.splice(index, 1);
          }

          var showSuccessMsg = function (err) {
            if (err) {
              return err;
            }

            $scope.showMsgSuccess = true;
            $scope.invitedTeam.push({
              toName: $scope.nameMember,
              toEmail: $scope.teamMember
            })
          }

          $scope.addTeamMember = function () {
            var data = {
              email: $scope.teamMember,
              name: $scope.nameMember
            };
            console.log("data: ", data);

            AppModel.addNewMember(data, $scope.currApp,
              showSuccessMsg);
          }
        }

        AppModel.getSingleApp($scope.currApp, populatePage);
      })
  }
])

.controller('appSettingsHealthCtrl', ['$scope', '$log', '$state',
  function ($scope, $log, $state) {
    $scope.activitydropdown = [{
      text: 'Daily'
    }, {
      text: 'Weekly'
    }, {
      text: 'Monthly'
    }, {
      text: 'Inactive'
    }];

    $scope.spenttimedropdown = [{
      text: '10 mins'
    }, {
      text: '30 mins'
    }, {
      text: '1 hr'
    }, {
      text: '2 hrs'
    }, {
      text: '5 hrs'
    }];

    $scope.pulsedropdown = [{
      text: '20%'
    }, {
      text: '30%'
    }, {
      text: '40%'
    }, {
      text: '50%'
    }, {
      text: '60%'
    }, {
      text: '70%'
    }, {
      text: '80%'
    }, {
      text: '90%'
    }, {
      text: '100%'
    }];

    $scope.purchasedlicensesdropdown = [{
      text: '20%'
    }, {
      text: '40%'
    }, {
      text: '60%'
    }, {
      text: '80%'
    }];
  }
])

.controller('appSettingsMessagesCtrl', ['$scope', '$log', '$state',
  '$stateParams', 'AppModel', 'AppService', 'CurrentAppService',
  function ($scope, $log, $state, $stateParams, AppModel, AppService,
    CurrentAppService) {


    CurrentAppService.getCurrentApp()
      .then(function (currentApp) {

        $scope.currApp = $stateParams.id;
        var populatePage = function () {
          $scope.color = AppService.getCurrentApp()
            .color;
          console.log("app color: ", $scope.color);
          if ($scope.color === '#39b3d7') {
            $scope.btnInfoWidth = '40px';
            $scope.btnInfoHeight = '40px';
            $scope.btnPrimaryWidth = '30px';
            $scope.btnPrimaryHeight = '30px';
            $scope.btnDefaultWidth = '30px';
            $scope.btnDefaultHeight = '30px';
            $scope.btnSuccessWidth = '30px';
            $scope.btnSuccessHeight = '30px';
            $scope.btnWarningWidth = '30px';
            $scope.btnWarningHeight = '30px';
            $scope.btnDangerWidth = '30px';
            $scope.btnDangerHeight = '30px';
          }
          if ($scope.color === '#3276b1') {
            $scope.btnInfoWidth = '30px';
            $scope.btnInfoHeight = '30px';
            $scope.btnPrimaryWidth = '40px';
            $scope.btnPrimaryHeight = '40px';
            $scope.btnDefaultWidth = '30px';
            $scope.btnDefaultHeight = '30px';
            $scope.btnSuccessWidth = '30px';
            $scope.btnSuccessHeight = '30px';
            $scope.btnWarningWidth = '30px';
            $scope.btnWarningHeight = '30px';
            $scope.btnDangerWidth = '30px';
            $scope.btnDangerHeight = '30px';
          }
          if ($scope.color === '#7f8c8d') {
            $scope.btnInfoWidth = '30px';
            $scope.btnInfoHeight = '30px';
            $scope.btnPrimaryWidth = '30px';
            $scope.btnPrimaryHeight = '30px';
            $scope.btnDefaultWidth = '40px';
            $scope.btnDefaultHeight = '40px';
            $scope.btnSuccessWidth = '30px';
            $scope.btnSuccessHeight = '30px';
            $scope.btnWarningWidth = '30px';
            $scope.btnWarningHeight = '30px';
            $scope.btnDangerWidth = '30px';
            $scope.btnDangerHeight = '30px';
          }
          if ($scope.color === '#18bc9c') {
            $scope.btnInfoWidth = '30px';
            $scope.btnInfoHeight = '30px';
            $scope.btnPrimaryWidth = '30px';
            $scope.btnPrimaryHeight = '30px';
            $scope.btnDefaultWidth = '30px';
            $scope.btnDefaultHeight = '30px';
            $scope.btnSuccessWidth = '40px';
            $scope.btnSuccessHeight = '40px';
            $scope.btnWarningWidth = '30px';
            $scope.btnWarningHeight = '30px';
            $scope.btnDangerWidth = '30px';
            $scope.btnDangerHeight = '30px';
          }
          if ($scope.color === '#f0ad4e') {
            $scope.btnInfoWidth = '30px';
            $scope.btnInfoHeight = '30px';
            $scope.btnPrimaryWidth = '30px';
            $scope.btnPrimaryHeight = '30px';
            $scope.btnDefaultWidth = '30px';
            $scope.btnDefaultHeight = '30px';
            $scope.btnSuccessWidth = '30px';
            $scope.btnSuccessHeight = '30px';
            $scope.btnWarningWidth = '40px';
            $scope.btnWarningHeight = '40px';
            $scope.btnDangerWidth = '30px';
            $scope.btnDangerHeight = '30px';
          }
          if ($scope.color === '#d9534f') {
            $scope.btnInfoWidth = '30px';
            $scope.btnInfoHeight = '30px';
            $scope.btnPrimaryWidth = '30px';
            $scope.btnPrimaryHeight = '30px';
            $scope.btnDefaultWidth = '30px';
            $scope.btnDefaultHeight = '30px';
            $scope.btnSuccessWidth = '30px';
            $scope.btnSuccessHeight = '30px';
            $scope.btnWarningWidth = '30px';
            $scope.btnWarningHeight = '30px';
            $scope.btnDangerWidth = '40px';
            $scope.btnDangerHeight = '40px';
          }
          // $scope.color = '#39b3d7'
          $scope.notfHeight = '150px';
          $scope.overflow = 'auto'
          $scope.marginTop = '3px';
          $scope.borderColor = $scope.color;
          $scope.borderRight = '1px solid' + $scope.color;
          $scope.borderTop = '1px solid' + $scope.color;
          $scope.borderBottom = '1px solid' + $scope.color;
          $scope.btnBackgrndColor = $scope.color;
          $scope.btnBorderColor = $scope.color;
          $scope.btnColor = '#ffffff';
          $scope.floatRight = 'right';

          $scope.borderRadius = '4px';
          $scope.showPreview = function (color) {
            $scope.color = color;
            if (color === '#39b3d7') {
              $scope.btnInfoWidth = '40px';
              $scope.btnInfoHeight = '40px';
              $scope.btnPrimaryWidth = '30px';
              $scope.btnPrimaryHeight = '30px';
              $scope.btnDefaultWidth = '30px';
              $scope.btnDefaultHeight = '30px';
              $scope.btnSuccessWidth = '30px';
              $scope.btnSuccessHeight = '30px';
              $scope.btnWarningWidth = '30px';
              $scope.btnWarningHeight = '30px';
              $scope.btnDangerWidth = '30px';
              $scope.btnDangerHeight = '30px';
            }
            if (color === '#3276b1') {
              $scope.btnInfoWidth = '30px';
              $scope.btnInfoHeight = '30px';
              $scope.btnPrimaryWidth = '40px';
              $scope.btnPrimaryHeight = '40px';
              $scope.btnDefaultWidth = '30px';
              $scope.btnDefaultHeight = '30px';
              $scope.btnSuccessWidth = '30px';
              $scope.btnSuccessHeight = '30px';
              $scope.btnWarningWidth = '30px';
              $scope.btnWarningHeight = '30px';
              $scope.btnDangerWidth = '30px';
              $scope.btnDangerHeight = '30px';
            }
            if (color === '#7f8c8d') {
              $scope.btnInfoWidth = '30px';
              $scope.btnInfoHeight = '30px';
              $scope.btnPrimaryWidth = '30px';
              $scope.btnPrimaryHeight = '30px';
              $scope.btnDefaultWidth = '40px';
              $scope.btnDefaultHeight = '40px';
              $scope.btnSuccessWidth = '30px';
              $scope.btnSuccessHeight = '30px';
              $scope.btnWarningWidth = '30px';
              $scope.btnWarningHeight = '30px';
              $scope.btnDangerWidth = '30px';
              $scope.btnDangerHeight = '30px';
            }
            if (color === '#18bc9c') {
              $scope.btnInfoWidth = '30px';
              $scope.btnInfoHeight = '30px';
              $scope.btnPrimaryWidth = '30px';
              $scope.btnPrimaryHeight = '30px';
              $scope.btnDefaultWidth = '30px';
              $scope.btnDefaultHeight = '30px';
              $scope.btnSuccessWidth = '40px';
              $scope.btnSuccessHeight = '40px';
              $scope.btnWarningWidth = '30px';
              $scope.btnWarningHeight = '30px';
              $scope.btnDangerWidth = '30px';
              $scope.btnDangerHeight = '30px';
            }
            if (color === '#f0ad4e') {
              $scope.btnInfoWidth = '30px';
              $scope.btnInfoHeight = '30px';
              $scope.btnPrimaryWidth = '30px';
              $scope.btnPrimaryHeight = '30px';
              $scope.btnDefaultWidth = '30px';
              $scope.btnDefaultHeight = '30px';
              $scope.btnSuccessWidth = '30px';
              $scope.btnSuccessHeight = '30px';
              $scope.btnWarningWidth = '40px';
              $scope.btnWarningHeight = '40px';
              $scope.btnDangerWidth = '30px';
              $scope.btnDangerHeight = '30px';
            }
            if (color === '#d9534f') {
              $scope.btnInfoWidth = '30px';
              $scope.btnInfoHeight = '30px';
              $scope.btnPrimaryWidth = '30px';
              $scope.btnPrimaryHeight = '30px';
              $scope.btnDefaultWidth = '30px';
              $scope.btnDefaultHeight = '30px';
              $scope.btnSuccessWidth = '30px';
              $scope.btnSuccessHeight = '30px';
              $scope.btnWarningWidth = '30px';
              $scope.btnWarningHeight = '30px';
              $scope.btnDangerWidth = '40px';
              $scope.btnDangerHeight = '40px';
            }
            $scope.btnHeight = '40px';
            $scope.btnWidth = '40px';
            console.log("color: ", color);
            $scope.borderColor = color;
            $scope.borderRight = '1px solid' + color;
            $scope.borderTop = '1px solid' + color;
            $scope.borderBottom = '1px solid' + color;
            $scope.btnBackgrndColor = color;
            $scope.btnBorderColor = color;
            $scope.btnColor = '#ffffff';
          }

          $scope.saveColor = function () {
            AppModel.updateColor($scope.currApp, $scope.color);
          }
        }


        AppModel.getSingleApp($scope.currApp, populatePage);
      })




  }
])

.controller('appSettingsEnvironmentCtrl', ['$scope', '$log', '$state',
  'AppService',
  function ($scope, $log, $state, AppService) {
    $scope.numLimit = 10;
    $scope.appsEnvironment = [];
    $scope.appsEnvironment = AppService.getLoggedInApps();
  }
])

.controller('appSettingsBillingCtrl', ['$scope', '$log', '$state',
  function ($scope, $log, $state) {

  }
])

.controller('appSettingsInstallationCtrl', ['$scope', '$log', '$state',
  function ($scope, $log, $state) {

  }
])

.controller('appSettingsInviteCtrl', ['$scope', '$rootScope', 'AppModel',
  'InviteIdService',
  function ($scope, $rootScope, AppModel, InviteIdService) {
    $scope.noError = true;
    $scope.error = false;
    var url = window.location.href;
    var appId = url.split("/")[4];
    var inviteId = url.split("/")[6];
    InviteIdService.setInviteId(inviteId);
    var showMsg = function (err) {
      if (err) {
        $scope.noError = false;
        $scope.error = true;
        return;
      } else {
        $scope.noError = true;
        $scope.error = false;
      }
    }

    AppModel.redirectUser(appId, inviteId, showMsg);

  }
])