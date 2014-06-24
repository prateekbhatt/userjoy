angular.module('do.register', [])

.config(['$stateProvider',
  function config($stateProvider) {
    $stateProvider.state('register', {
      url: '/register',
      views: {
        "main": {
          controller: 'RegisterCtrl',
          templateUrl: 'templates/register.tpl.html'
        }
      },
      data: {
        pageTitle: 'Register'
      }
    });
  }
])

.controller('RegisterCtrl', ['$scope', 'config',
  function RegisterController($scope, config,
    UserModel) {
    $scope.newUser = {};

    $scope.createUser = function (newUser) {
      UserModel.create(newUser)
        .then(function (model) {
          config.currentUser = model;
          $scope.newUser = {};
          console.log(model);
          // TODO: client-side redirect to /messages
        });
    };
  }
]);