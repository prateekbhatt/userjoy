angular.module('do.settings', [])

.config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('settings', {
                url: '/settings',
                views: {
                    "main": {
                        templateUrl: '/templates/settings.html',
                        controller: 'profileSettingsCtrl'
                    }
                },
                authenticate: true
            })
            .state('profilesettings', {
                url: '/settings/profile',
                views: {
                    "main": {
                        templateUrl: '/templates/settings.profile.html',
                        controller: 'profileSettingsCtrl',
                    }
                },
                authenticate: true
            })
            .state('changePassword', {
                url: '/settings/changePassword',
                views: {
                    "main": {
                        templateUrl: '/templates/settings.profile.changePassword.html',
                        controller: 'changePasswordCtrl',
                    }
                },
                authenticate: true
            })
            .state('appsettings', {
                url: '/settings/app',
                views: {
                    "main": {
                        templateUrl: '/templates/settings.app.html',
                        controller: 'appSettingsCtrl',
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

        function setName() {
            var account = AccountService.get();
            if (typeof account === 'object') {
                $scope.name = account.name;
            }
        }

        function init() {
            setName();            
        }

        $scope.name = '';

        init();

        $scope.$watch(AccountService.get, setName);


        if (window.location.href ===
            'http://app.do.localhost/settings') {
            $location.path('/settings/profile');
        }

        $scope.changeProfileName = function () {
            AccountModel.updateName($scope.name, function (err, acc) {
                if (err) {
                    $log.error('failed to update name', err);
                    return;
                }

                AccountService.set(acc);
            });
        }
    }
])

.controller('changePasswordCtrl', ['$scope', 'AccountModel', '$log', 
    function ($scope, AccountModel, $log) {

        $scope.changePassword = function () {
            AccountModel.updatePwd($scope.current_pwd, $scope.new_pwd, function(err, data){
                if(err) {
                    $log.error('failed to update pwd:', err);
                    return;
                } 

                $log.info("password changed successfully!")
            })
        }
    }
])

.controller('appSettingsCtrl', ['$scope', '$log', '$state',
    function ($scope, $log, $state) {

        if (window.location.href ===
            'http://app.do.localhost/settings') {
            $location.path('/settings/profile');
        }

    }
])