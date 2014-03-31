angular.module('do.login', [])

    .config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('login', {
                    url: '/login',
                    views: {
                        "main": {
                            templateUrl: '/templates/login.html',
                            controller: 'LoginCtrl'
                        }
                    }
                })

        }
    ])

    .controller('LoginCtrl', ['$scope', function ($scope) {
            
    }]);

