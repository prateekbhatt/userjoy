angular.module('dodatado', [
    'ui.bootstrap',
    'ui.router',
    // 'ngSails',
    'ivpusic.cookie',
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
    'do.signup',
    'do.install',
    'do.settings',
    'do.feed'
])

.config(function myAppConfig($stateProvider, $urlRouterProvider,
    $locationProvider, $httpProvider, $provide) {
    $urlRouterProvider.otherwise('/404');
    $locationProvider.html5Mode(true);

    // for making cross domain authentication requests
    $httpProvider.defaults.useXDomain = true;
    $httpProvider.defaults.withCredentials = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    // adding custom tool to textAngular
    $provide.decorator('taOptions', ['taRegisterTool', '$delegate',
        function (taRegisterTool, taOptions) {
            // $delegate is the taOptions we are decorating
            // register the tool with textAngular
            taRegisterTool('dropdown', {
                display: "<span class='dropdown'>" +
                    "<button class='btn btn-default dropdown-toggle' type='button' ng-disabled='showHtml()'><i class='fa fa-caret-down'></i></button>" +
                    "<ul class='dropdown-menu'><li ng-repeat='o in options' ng-model='o.value' ng-click='action(o.value)'>{{o.name}}</li></ul>" +
                    "</span>",
                action: function (size) {
                    if (size !== '' && typeof (size) === "string") {
                        size = size + " ";
                        return this.$editor()
                            .wrapSelection('insertText', size);
                    }
                },
                // TODO: Get data from backend
                options: [{
                    name: 'App Name',
                    value: '{{app_name}}'
                }, {
                    name: 'First Name',
                    value: '{{first_name}}'
                }, {
                    name: 'Last Name',
                    value: '{{last_name}}'
                }, {
                    name: 'Email',
                    value: '{{email}}'
                }, {
                    name: 'User Id',
                    value: '{{user_id}}'
                }, {
                    name: 'status',
                    value: '{{status}}'
                }]
            });

            // add the button to the default toolbar definition
            taOptions.toolbar[1].push('dropdown');
            return taOptions;
        }
    ]);


})

.run(['LoginService', 'ipCookie', '$log',
    function (LoginService, ipCookie, $log) {

        // check cookie to set if user is authenticated
        if (ipCookie('loggedin')) {
            // $log.info('app.run setUserAuthenticated');
            LoginService.setUserAuthenticated(true);
        }
    }
])

.run(['AccountService', 'AccountModel', '$log',
    function (AccountService, AccountModel, $log) {
        AccountModel.get(function (err, acc) {
            if (err) {
                return;
            }
            console.log("accounts", acc);
            AccountService.set(acc);
        });
    }
])

.run(['LoggedInAppService', 'AppModel', '$log',
    function (LoggedInAppService, AppModel, $log) {
        AppModel.get(function (err, apps) {
            if (err) {
                return;
            }
            LoggedInAppService.setLoggedInApps(apps);
            console.log("apps log", LoggedInAppService.getLoggedInApps());
            LoggedInAppService.setCurrentApp(apps[0]);
        });
    }
])
    .run(['$state', 'LoginService', '$rootScope',
        function ($state, LoginService, $rootScope) {

            // check if user needs to be logged in to view a specific page
            $rootScope.$on("$stateChangeStart", function (event, toState,
                toParams, fromState, fromParams) {
                if (toState.authenticate && !LoginService.getUserAuthenticated()) {
                    // User isn’t authenticated
                    $state.go("login");
                    event.preventDefault();
                }
            });
        }
    ])

.run(['segment', 'queryMatching',
    function (segment, queryMatching) {

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
    }
])


.controller('AppCtrl', function AppCtrl($scope) {

});