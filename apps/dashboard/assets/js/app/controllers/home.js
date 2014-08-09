angular.module('do.home', [])

.config(['$stateProvider',
  function config($stateProvider) {
    $stateProvider.state('home', {
      url: '/',
      views: {
        "main": {
          controller: 'HomeCtrl',
          templateUrl: 'templates/home.tpl.html'
        }
      },
      data: {
        pageTitle: 'Home'
      }
    });
  }
])

.controller('HomeCtrl', ['$scope', '$state',
  function HomeController($scope, $state) {
    console.log("reached /");
    $state.go('login');
  }
]);
