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

.controller('SignupCtrl', ['$scope', 'InviteIdService', 'InviteModel',
    function ($scope, InviteIdService, InviteModel) {
        console.log("Invite id: ", InviteIdService.getInviteId());
        $scope.createAccount = function () {
            InviteModel.registerInvitedMember($scope.email, $scope.password,
                InviteIdService.getInviteId());
        }
    }
]);