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