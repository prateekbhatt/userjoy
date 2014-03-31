angular.module('dodatado', [
    'ui.bootstrap',
    'ui.router',
    // 'ngSails',
    'angularMoment',
    'lodash',
    'services',
    'models',
    'ngTable',
    'mgcrea.ngStrap',
    // 'templates-dev',

    'do.navbar',
    'do.home',
    'do.register',
    'do.users',
    'ngSanitize',
    'do.message',
    'textAngular',
    'do.popupmessage',
    'nvd3ChartDirectives',
    'do.login',
    'do.signup'
])

.config(function myAppConfig($stateProvider, $urlRouterProvider,
    $locationProvider) {
    $urlRouterProvider.otherwise('/404');
    $locationProvider.html5Mode(true);
})

.run(['segment', 'queryMatching', function run(segment, queryMatching) {
    // FIXME : get data from backend
    var allSegments = [{
        _id: "0",
        name: "Phone Users"
    }, {
        _id: "1",
        name: "Android Users"
    }, {
        _id: "2",
        name: "Paying Customers"
    }];

    var allQueries = [{
        id: "0",
        name: "is"
    }, {
        id: "1",
        name: "is not"
    }, {
        id: "2",
        name: "contains"
    }, {
        id: "3",
        name: "does not contain"
    }];

    segment.set.all(allSegments);

    queryMatching.set.all(allQueries);

    /**
     * Set the first segmentation as the default selected segmentation
     */

    segment.set.selected(allSegments[0]);
    /**
     * Set the first query as the default selected query
     */

    queryMatching.set.selected(allQueries[0]);
}])

.controller('AppCtrl', function AppCtrl($scope) {});