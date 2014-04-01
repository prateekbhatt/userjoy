    // .controller("ProfileDropdownCtrl", function ($scope, $log, profile) {

    //     // FIXME : add dependency injection to this controller

    //     $scope.profiles = profile.get.all();
    //     $scope.selectedProfile = profile.get.selected();

    //     $scope.profileChanged = function () {
    //         profile.set.selected($scope.selectedProfile);
    //     };


    // })
    // .controller('IntervalDropdownCtrl', ['$scope', '$log',
    //     'timeInterval',
    //     function ($scope, $log, timeInterval) {

    //         $scope.allIntervals = timeInterval.get.all();
    //         $scope.selectedInterval = timeInterval.get.selected();

    //         $scope.timeIntervalChanged = function () {
    //             timeInterval.set.selected($scope.selectedInterval);
    //         };

    //     }
    // ])
    // .controller("DatepickerDemoCtrl", function ($scope, $log,
    //     timeInterval, reportTime) {

    //     // FIXME : add dependency injection to this controller

    //     var setMax = function () {
    //         var maxDt = moment()
    //             .subtract('days', 1)
    //             .format();
    //         $scope.maxDate = maxDt;
    //     };

    //     $scope.$watch(reportTime.get, function (newTime) {
    //         $log.info('[DatepickerDemoCtrl] [watch reportTime]',
    //             newTime);

    //         if (newTime) {
    //             $scope.dt = moment(newTime, 'DD-MM-YYYY')
    //                 .format();
    //             setMax();
    //         }
    //     });

    //     /**
    //      * When the user selects a new date,
    //      * the ng-change event fires this function.
    //      *
    //      * @api public
    //      */
    //     $scope.dateChanged = function () {

    //         var reportDateChanged = moment($scope.dt)
    //             .format('DD-MM-YYYY');

    //         reportTime.set(reportDateChanged);

    //     };

    //     $scope.open = function ($event) {
    //         $event.preventDefault();
    //         $event.stopPropagation();
    //         $scope.opened = true;
    //     };
    //     $scope.format = 'dd-MMMM-yyyy';
    // })
    // .controller('ReportCtrl', ['$scope', '$routeParams', '$location',
    //     '$http', 'profile', 'reportTime', 'timeInterval',
    //     'shareBarChartData', '$modal', '$log', '$route',

    //     function ($scope, $routeParams, $location, $http,
    //         profile, reportTime, timeInterval, shareBarChartData,
    //         $modal, $log, $route) {

    //         /**
    //          * Controller to fetch and render
    //          * reports from the server
    //          */

    //         $scope.streamId = $routeParams.streamId;
    //         $scope.reportTime = $routeParams.reportTime;
    //         $scope.insights = [];


    //         var updateReport = function () {

    //             var selectedProfile = profile.get.selected(),
    //                 platform = selectedProfile.platform,
    //                 streamId = selectedProfile._id,
    //                 reportDate = reportTime.get(),
    //                 reportUrl = '/reports/time/' +
    //                     reportDate +
    //                     '/streams/' + streamId;

    //             return $location.path(reportUrl);
    //         };


    //         $scope.$watch(timeInterval.get.selected, function () {
    //             $log.info('[ReportCtrl] [watch timeInterval]',
    //                 arguments);

    //             return updateReport();
    //         });

    //         $scope.$watch(profile.get.selected, function () {
    //             $log.info('[ReportCtrl] [watch profile]',
    //                 arguments);

    //             return updateReport();
    //         });

    //         $scope.$watch(reportTime.get, function () {
    //             $log.info('[ReportCtrl] [watch reportTime]',
    //                 arguments);

    //             return updateReport();
    //         });

    //         $scope.getReport = function () {

    //             $log.info('[ReportCtrl] [getReport]', $scope.streamId);

    //             var REPORT_API_URL =
    //                 "http://localhost:3000/api/reports/time/" +
    //                 $scope.reportTime + "/streams/" + $scope.streamId;

    //             $http.get(REPORT_API_URL)
    //                 .success(function (data) {
    //                     $log.info('[ReportCtrl] [getReport] [Success]');
    //                     data = {};
    //                     data.insights = [{
    //                         _id: '1',
    //                         displayName: 'Visit_Bounce_Rate',
    //                         description: 'Visitors from Medianama.com were more engaged on your site yesterday',
    //                         endValue: '0',
    //                         startValue: '100'
    //                     }, {
    //                         _id: '2',
    //                         displayName: 'Page_Views',
    //                         description: 'Visitors from Medianama.com were more engaged on your site today',
    //                         endValue: '0',
    //                         startValue: '100'
    //                     }]

    //                     $scope.insights = [];

    //                     for (var i = 0, len = data.insights.length; i <
    //                         len; i++) {
    //                         $scope.insights.push(data.insights[i])
    //                     };
    //                 });
    //         };
    //     }
    // ])
    // .controller('switchViewCtrl', ['$scope', 'profile',
    //     function ($scope, profile) {

    //         $scope.$watch(profile.get.selected, function (newValue,
    //             oldValue, $scope) {

    //             $scope.profile = profile.get.selected()
    //                 .platform;
    //         });
    //     }
    // ])

    //new dashboard controllers are from this point

    angular.module('do.users', [])

    .config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('users', {
                    url: '/users',
                    views: {
                        "main": {
                            templateUrl: '/templates/users.html',
                            controller: 'UserSegmentCtrl'
                        }
                    }
                })
                .state('users.segment', {
                    url: '/segment',
                    views: {
                        "panel": {
                            templateUrl: '/templates/users.segment.html'
                        }
                    }
                })
                .state('users.list', {
                    url: '/list',
                    views: {
                        "panel": {
                            templateUrl: '/templates/users.list.html'
                        },
                        "table": {
                            templateUrl: '/templates/users.list.table.html',
                            controller: 'TableCtrl'
                        }
                    },

                })
                .state('profile', {
                    url: '/users/profile/id',
                    views: {
                        "main": {
                            templateUrl: '/templates/users.profile.html',
                            controller: 'ProfileCtrl'
                        }
                    }

                });

        }
    ])

    .controller('UserSegmentCtrl', ['$scope', '$location', 'segment',
        'queryMatching', '$filter',
        'ngTableParams',
        function ($scope, $location, segment, queryMatching, $filter,
            ngTableParams) {

            $scope.isActive = function (viewLocation) {
                return viewLocation === $location.path();
            };


            var segments = segment.get.all();
            $scope.dropdown = [];
            for (var i = segments.length - 1; i >= 0; i--) {
                $scope.dropdown.push({
                    text: segments[i].name
                });
            };


            $scope.segments = segment.get.all();
            $scope.selectedSegment = segment.get.selected();



            $scope.queries = queryMatching.get.all();
            $scope.query = [];
            $scope.selectedQuery = queryMatching.get.selected();
            for (var i = $scope.queries.length - 1; i >= 0; i--) {
                $scope.query.push({
                    text: $scope.queries[i]['name']
                })
            };


            $scope.text = 'AND';
            $scope.segmentFilterCtrl = segment.get.selected();
            $scope.queryFilterCtrl = queryMatching.get.selected();
            $scope.filters = [];
            $scope.addAnotherFilter = function addAnotherFilter() {
                $scope.filters.push({
                    segment: $scope.segmentFilterCtrl,
                    type: $scope.queryFilterCtrl
                })
            }
            $scope.removeFilter = function removeFilter(
                filterToRemove) {
                var index = $scope.filters.indexOf(
                    filterToRemove);
                $scope.filters.splice(index, 1);
            }
            $scope.switchAndOr = function switchAndOr() {
                if ($scope.text === 'AND') {
                    $scope.text = 'OR'
                } else {
                    $scope.text = 'AND'
                }
            }
        }
    ])

    .controller('TableCtrl', ['$scope', '$filter', 'ngTableParams',
        function ($scope, $filter, ngTableParams) {
            var data = [{
                name: "Moroni",
                email: 'a@b.com',
                userkarma: 56,
                datejoined: '3rd Aug',
                status: 'risky'
            }, {
                name: "Tiancum",
                email: 'a@b.com',
                userkarma: 56,
                datejoined: '3rd Aug',
                status: 'risky'
            }, {
                name: "Jacob",
                email: 'a@b.com',
                userkarma: 56,
                datejoined: '3rd Aug',
                status: 'risky'
            }, {
                name: "Nephi",
                email: 'a@b.com',
                userkarma: 56,
                datejoined: '3rd Aug',
                status: 'risky'
            }, {
                name: "Enos",
                email: 'a@b.com',
                userkarma: 56,
                datejoined: '3rd Aug',
                status: 'risky'
            }, {
                name: "Tiancum",
                email: 'a@b.com',
                userkarma: 56,
                datejoined: '3rd Aug',
                status: 'risky'
            }, {
                name: "Jacob",
                email: 'a@b.com',
                userkarma: 56,
                datejoined: '3rd Aug',
                status: 'risky'
            }, {
                name: "Nephi",
                email: 'a@b.com',
                userkarma: 56,
                datejoined: '3rd Aug',
                status: 'risky'
            }, {
                name: "Enos",
                email: 'a@b.com',
                userkarma: 56,
                datejoined: '3rd Aug',
                status: 'risky'
            }, {
                name: "Tiancum",
                email: 'a@b.com',
                userkarma: 56,
                datejoined: '3rd Aug',
                status: 'risky'
            }, {
                name: "Jacob",
                email: 'a@b.com',
                userkarma: 56,
                datejoined: '3rd Aug',
                status: 'risky'
            }, {
                name: "Nephi",
                email: 'a@b.com',
                userkarma: 56,
                datejoined: '3rd Aug',
                status: 'risky'
            }, {
                name: "Enos",
                email: 'a@b.com',
                userkarma: 56,
                datejoined: '3rd Aug',
                status: 'risky'
            }, {
                name: "Tiancum",
                email: 'a@b.com',
                userkarma: 56,
                datejoined: '3rd Aug',
                status: 'risky'
            }, {
                name: "Jacob",
                email: 'a@b.com',
                userkarma: 56,
                datejoined: '4th Aug',
                status: 'risky'
            }, {
                name: "Nephi",
                email: 'a@b.com',
                userkarma: 56,
                datejoined: '3rd Aug',
                status: 'risky'
            }, {
                name: "Enos",
                email: 'a@b.com',
                userkarma: 56,
                datejoined: '3rd Aug',
                status: 'risky'
            }];
            $scope.columns = [{
                title: 'Name',
                field: 'name',
                visible: true,
                filter: {
                    'name': 'text'
                }
            }, {
                title: 'Email',
                field: 'email',
                visible: true
            }, {
                title: 'User Karma',
                field: 'userkarma',
                visible: true
            }, {
                title: 'Date Joined',
                field: 'datejoined',
                visible: true
            }, {
                title: 'Status',
                field: 'status',
                visible: true
            }];
            $scope.tableParams = new ngTableParams({
                page: 1, // show first page
                count: 10, // count per page
                filter: {
                    name: 'M' // initial filter
                },
                sorting: {
                    name: 'asc'
                }
            }, {
                total: data.length, // length of data
                getData: function ($defer, params) {
                    // use build-in angular filter
                    var filteredData = params.filter() ?
                        $filter('filter')(data, params
                            .filter()) :
                        data;
                    var orderedData = params.sorting() ?
                        $filter('orderBy')(data,
                            params.orderBy()) :
                        data;
                    params.total(orderedData.length); // set total for recalc paginationemail

                    $defer.resolve(orderedData.slice((
                            params.page() -
                            1) * params.count(),
                        params.page() *
                        params.count()));
                }
            });

            $scope.tabledropdown = {

            }

        }
    ])

    .controller('ProfileCtrl', ['$scope',
        function ($scope) {

            // Get data from backend

            $scope.healthScore = '50';
            $scope.plan = 'Basic';
            $scope.planValue = '$25';
            $scope.renewal = '25 Mar 2014';
            $scope.firstSeen = '3 months ago';
            $scope.lastSession = '2 months ago';
            $scope.country = 'India';
            $scope.os = 'Ubuntu';
            $scope.browser = 'Mozilla Firefox';

            $scope.exampleData = [{
                "key": "Series 1",
                "values": [
                    [1025409600000, 0],
                    [1028088000000, -6.3382185140371],
                    [1030766400000, -5.9507873460847],
                    [1033358400000, -11.569146943813],
                    [1036040400000, -5.4767332317425],
                    [1038632400000, 0.50794682203014],
                    [1041310800000, -5.5310285460542],
                    [1043989200000, -5.7838296963382],
                    [1046408400000, -7.3249341615649],
                    [1049086800000, -6.7078630712489],
                    [1051675200000, 0.44227126150934],
                    [1054353600000, 7.2481659343222],
                    [1056945600000, 9.2512381306992],
                    [1059624000000, 11.341210982529],
                    [1062302400000, 14.734820409020],
                    [1064894400000, 12.387148007542],
                    [1067576400000, 18.436471461827],
                    [1070168400000, 19.830742266977],
                    [1072846800000, 22.643205829887],
                    [1075525200000, 26.743156781239],
                    [1078030800000, 29.597478802228],
                    [1080709200000, 30.831697585341],
                    [1083297600000, 28.054068024708],
                    [1085976000000, 29.294079423832],
                    [1088568000000, 30.269264061274],
                    [1091246400000, 24.934526898906],
                    [1093924800000, 24.265982759406],
                    [1096516800000, 27.217794897473],
                    [1099195200000, 30.802601992077],
                    [1101790800000, 36.331003758254],
                    [1104469200000, 43.142498700060],
                    [1107147600000, 40.558263931958],
                    [1109566800000, 42.543622385800],
                    [1112245200000, 41.683584710331],
                    [1114833600000, 36.375367302328],
                    [1117512000000, 40.719688980730],
                    [1120104000000, 43.897963036919],
                    [1122782400000, 49.797033975368],
                    [1125460800000, 47.085993935989],
                    [1128052800000, 46.601972859745],
                    [1130734800000, 41.567784572762],
                    [1133326800000, 47.296923737245],
                    [1136005200000, 47.642969612080],
                    [1138683600000, 50.781515820954],
                    [1141102800000, 52.600229204305],
                    [1143781200000, 55.599684490628],
                    [1146369600000, 57.920388436633],
                    [1149048000000, 53.503593218971],
                    [1151640000000, 53.522973979964],
                    [1154318400000, 49.846822298548],
                    [1156996800000, 54.721341614650],
                    [1159588800000, 58.186236223191],
                    [1162270800000, 63.908065540997],
                    [1164862800000, 69.767285129367],
                    [1167541200000, 72.534013373592],
                    [1170219600000, 77.991819436573],
                    [1172638800000, 78.143584404990],
                    [1175313600000, 83.702398665233],
                    [1177905600000, 91.140859312418],
                    [1180584000000, 98.590960607028],
                    [1183176000000, 96.245634754228],
                    [1185854400000, 92.326364432615],
                    [1188532800000, 97.068765332230],
                    [1191124800000, 105.81025556260],
                    [1193803200000, 114.38348777791],
                    [1196398800000, 103.59604949810],
                    [1199077200000, 101.72488429307],
                    [1201755600000, 89.840147735028],
                    [1204261200000, 86.963597532664],
                    [1206936000000, 84.075505208491],
                    [1209528000000, 93.170105645831],
                    [1212206400000, 103.62838083121],
                    [1214798400000, 87.458241365091],
                    [1217476800000, 85.808374141319],
                    [1220155200000, 93.158054469193],
                    [1222747200000, 65.973252382360],
                    [1225425600000, 44.580686638224],
                    [1228021200000, 36.418977140128],
                    [1230699600000, 38.727678144761],
                    [1233378000000, 36.692674173387],
                    [1235797200000, 30.033022809480],
                    [1238472000000, 36.707532162718],
                    [1241064000000, 52.191457688389],
                    [1243742400000, 56.357883979735],
                    [1246334400000, 57.629002180305],
                    [1249012800000, 66.650985790166],
                    [1251691200000, 70.839243432186],
                    [1254283200000, 78.731998491499],
                    [1256961600000, 72.375528540349],
                    [1259557200000, 81.738387881630],
                    [1262235600000, 87.539792394232],
                    [1264914000000, 84.320762662273],
                    [1267333200000, 90.621278391889],
                    [1270008000000, 102.47144881651],
                    [1272600000000, 102.79320353429],
                    [1275278400000, 90.529736050479],
                    [1277870400000, 76.580859994531],
                    [1280548800000, 86.548979376972],
                    [1283227200000, 81.879653334089],
                    [1285819200000, 101.72550015956],
                    [1288497600000, 107.97964852260],
                    [1291093200000, 106.16240630785],
                    [1293771600000, 114.84268599533],
                    [1296450000000, 121.60793322282],
                    [1298869200000, 133.41437346605],
                    [1301544000000, 125.46646042904],
                    [1304136000000, 129.76784954301],
                    [1306814400000, 128.15798861044],
                    [1309406400000, 121.92388706072],
                    [1312084800000, 116.70036100870],
                    [1314763200000, 88.367701837033],
                    [1317355200000, 59.159665765725],
                    [1320033600000, 79.793568139753],
                    [1322629200000, 75.903834028417],
                    [1325307600000, 72.704218209157],
                    [1327986000000, 84.936990804097],
                    [1330491600000, 93.388148670744]
                ]
            }];

            $scope.xAxisTickFormatFunction = function () {

                return function (d) {

                    return d3.time.format('%x')(new Date(d)); //uncomment for date format

                }

            }

        }
    ])