angular.module('do.signup', [])

    .config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('signup', {
                    url: '/signup',
                    views: {
                        "main": {
                            templateUrl: '/templates/signup.html',
                            controller: 'SignupCtrl'
                        }
                    }
                });

        }
    ])

    .controller('SignupCtrl', ['$scope', function ($scope) {
            
    }]);