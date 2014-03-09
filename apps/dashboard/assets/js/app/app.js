angular.module( 'dodatado', [
	'ui.router',
	// 'ngSails',
	'angularMoment',
  'lodash',
	'services',
	'models',
	// 'templates-dev',

  'do.home',
	'do.register'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider, $locationProvider ) {
	$urlRouterProvider.otherwise( '/home' );
	$locationProvider.html5Mode(true);
})

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope ) {
});
