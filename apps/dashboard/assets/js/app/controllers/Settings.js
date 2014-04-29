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
                url: '/app/settings',
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

    }
])


.controller('profileSettingsCtrl', ['$scope', '$log', '$state', '$location',
    '$http', 'config', 'AccountService', 'AccountModel',
    function ($scope, $log, $state, $location, $http, config,
        AccountService, AccountModel) {

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


        if (window.location.href ===
            'http://app.do.localhost/account') {
            $location.path('/users/list');
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

        if (window.location.href ===
            'http://app.do.localhost/app/settings') {
            $location.path('/app/settings/general');
        }

    }
])

.controller('appSettingsGeneralCtrl', ['$scope', '$log', '$state',
    'AppService', 'AppModel',
    function ($scope, $log, $state, AppService, AppModel) {
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
])

.controller('appSettingsTeamCtrl', ['$scope', '$log', '$state',
    function ($scope, $log, $state) {

        // TODO: Get data from backend
        $scope.team = [{
            name: 'Savinay Narendra',
            email: 'savinay.90@gmail.com',
            incomingEmail: 'savinay.90@gmail.mail.dodatado.io'
        }, {
            name: 'Savinay Narendra',
            email: 'savinay.90@gmail.com',
            incomingEmail: 'savinay.90@gmail.mail.dodatado.io'
        }]

        $scope.removeTeamMember = function (teamMember) {
            // TODO: Add code to remove team member
            $log.info("team member removed function called");
            var index = $scope.team.indexOf(teamMember);
            $scope.team.splice(index,1);
        }
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
    function ($scope, $log, $state) {

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
