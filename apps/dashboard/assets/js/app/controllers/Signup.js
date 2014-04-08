angular.module('do.signup', [])

    .config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('signup', {
                    url: '/signup',
                    views: {
                        "main": {
                            templateUrl: '/templates/LoginSignup/signup.html',
                            controller: 'SignupCtrl',
                            authenticate: false
                        }
                    }
                });

        }
    ])

    .controller('SignupCtrl', ['$scope', function ($scope) {
            
    }]);