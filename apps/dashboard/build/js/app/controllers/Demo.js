angular.module('do.demo', [])

.config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('demo', {
        url: '/demo',
        views: {
          "main": {
            templateUrl: '/templates/demo/demo.html',
            controller: 'DemoCtrl',
            authenticate: false
          }
        }
      })

  }
])

.controller('DemoCtrl', ['$scope', '$location', 'AuthService', '$rootScope',
  'config',
  function ($scope, $location, AuthService, $rootScope, config) {
    $rootScope.demo = true;

    // config.siteName = 'DoDataDo';
    // config.siteUrl = '/';
    // config.apiUrl = 'https://demo.userjoy.co';
    // config.cookieDomain = '.userjoy.co';
    // config.currentUser = false;

    AuthService.attemptLogin('demo@userjoy.co', 'demodemo', function (err) {
      if (err) {
        console.log("error");
        return;
      }
    })
  }
])
