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
  'AppService',
  function ($scope, InviteIdService, InviteModel, AppService) {
    console.log("Invite id: ", InviteIdService.getInviteId());
    $scope.email = AppService.getEmail();
    $scope.createAccount = function () {
      InviteModel.registerInvitedMember($scope.email, $scope.password,
        $scope.name, InviteIdService.getInviteId());
    }
  }
]);