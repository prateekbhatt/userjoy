angular.module('do.message', [])

    .config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('message', {
                    url: '/messages',
                    views: {
                        "main": {
                            templateUrl: '/templates/message.html',
                            controller: 'MessageCtrl'
                        }
                    }
                })
                .state('message.inbox', {
                    url: '/inbox',
                    views: {
                        "messageapp": {
                            templateUrl: '/templates/message.inbox.html'
                        }
                    }
                })
                .state('message.sent', {
                    url: '/sent',
                    views: {
                        "messageapp": {
                            templateUrl: '/templates/message.sent.html'
                        }
                    }

                });


        }
    ])

    .controller('MessageCtrl', ['$scope', '$filter', 'ngTableParams',
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
            
            $scope.columns = [{
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
        }
    ]);