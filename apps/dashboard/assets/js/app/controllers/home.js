angular.module('do.home', [])

.config(function config($stateProvider) {
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
})

.controller('HomeCtrl', ['$scope', '$state',
  function HomeController($scope, $state) {
    $state.go('login');
  }
]);