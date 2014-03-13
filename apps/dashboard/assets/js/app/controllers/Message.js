angular.module('do.message', [])

    .config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('message', {
                    url: '/messages',
                    views: {
                        "main": {
                            templateUrl: '/templates/message.html',
                            controller: 'InboxCtrl'
                        }
                    }
                })
                .state('message.inbox', {
                    url: '/inbox',
                    views: {
                        "messageapp": {
                            templateUrl: '/templates/message.inbox.html',
                            controller: 'InboxCtrl'
                        }
                    }
                })
                .state('message.sent', {
                    url: '/sent',
                    views: {
                        "messageapp": {
                            templateUrl: '/templates/message.sent.html',
                            controller: 'SentCtrl'
                        }
                    }

                })
                .state('message.compose', {
                    url: '/compose',
                    views: {
                        "messageapp": {
                            templateUrl: '/templates/message.compose.html'
                        }
                    }

                }).state('message.compose.automate', {
                    url: '/automate',
                    views: {
                        "automatemsg": {
                            templateUrl: '/templates/message.compose.automate.html'
                        }
                    }

                }).state('message.compose.automate.write', {
                    url: '/write',
                    views: {
                        "automatemsgwrite": {
                            templateUrl: '/templates/message.compose.automate.write.html'
                        }
                    }

                });



        }
    ])

    .controller('InboxCtrl', ['$scope', '$filter', 'ngTableParams',
        function MessageCtrl($scope, $filter, ngTableParams) {
            

            var data = [{
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM'
            }, {
                name: 'Larro Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM'
            }];
            
            $scope.columnsInbox = [{
                title: 'User',
                field: 'name',
                visible: true,
                filter: {
                    'name': 'text'
                }
            }, {
                title: 'Text',
                field: 'subject',
                visible: true
            }, {
                title: 'When',
                field: 'time',
                visible: true
            }];

            $scope.tableParamsInbox = new ngTableParams({
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
        }
    ])

    .controller('SentCtrl', ['$scope', '$filter', 'ngTableParams',
        function MessageCtrl($scope, $filter, ngTableParams) {

            var data = [{
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM',
                opened: 'Yes',
                replied: 'No'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM',
                opened: 'Yes',
                replied: 'No'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM',
                opened: 'Yes',
                replied: 'No'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM',
                opened: 'Yes',
                replied: 'No'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM',
                opened: 'Yes',
                replied: 'No'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM',
                opened: 'Yes',
                replied: 'No'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM',
                opened: 'Yes',
                replied: 'No'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM',
                opened: 'Yes',
                replied: 'No'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM',
                opened: 'Yes',
                replied: 'No'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM',
                opened: 'Yes',
                replied: 'No'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM',
                opened: 'Yes',
                replied: 'No'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM',
                opened: 'Yes',
                replied: 'No'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM',
                opened: 'Yes',
                replied: 'No'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM',
                opened: 'Yes',
                replied: 'No'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM',
                opened: 'Yes',
                replied: 'No'
            }, {
                name: 'Larry Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM',
                opened: 'Yes',
                replied: 'No'
            }, {
                name: 'Larro Page',
                subject: 'Hi, Thanks for such an offer. I really....',
                time: '3:29 PM',
                opened: 'Yes',
                replied: 'No'
            }];
            
            $scope.columnsSent = [{
                title: 'User',
                field: 'name',
                visible: true,
                filter: {
                    'name': 'text'
                }
            }, {
                title: 'Text',
                field: 'subject',
                visible: true
            }, {
                title: 'When',
                field: 'time',
                visible: true
            }, {
                title: 'Opened',
                field: 'opened',
                visible:'true'
            },{
                title: 'Replied',
                field: 'replied',
                visible: 'true'
            }];

            $scope.tableParamsSent = new ngTableParams({
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
                    var ordereddata = params.sorting() ?
                        $filter('orderBy')(data,
                            params.orderBy()) :
                        data;
                    params.total(ordereddata.length); // set total for recalc paginationemail

                    $defer.resolve(ordereddata.slice((
                            params.page() -
                            1) * params.count(),
                        params.page() *
                        params.count()));
                }
            }); 
        }
    ]);