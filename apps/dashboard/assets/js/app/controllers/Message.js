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
            .state('message.id', {
                url: '/inbox/1',
                views: {
                    "messageapp": {
                        templateUrl: '/templates/message.inbox.id.html',
                        controller: 'MessageBodyCtrl'
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

            })
            .state('message.automate', {
                url: '/compose/automate',
                views: {
                    "messageapp": {
                        templateUrl: '/templates/message.compose.automate.html',
                        controller: 'messageAutomateCtrl'
                    }
                }

            })
            .state('message.manual', {
                url: '/compose/manual',
                views: {
                    "messageapp": {
                        templateUrl: '/templates/message.compose.manual.html',
                        controller: 'messageManualCtrl'
                    }
                }

            })
            .state('message.write', {
                url: '/compose/automate/write',
                views: {
                    "messageapp": {
                        templateUrl: '/templates/message.compose.automate.write.html',
                        controller: 'textAngularCtrl'
                    }
                }

            })
            .state('message.template', {
                url: '/compose/template',
                views: {
                    "messageapp": {
                        templateUrl: '/templates/message.compose.template.html',
                        controller: 'templateCtrl'
                    }
                }

            });



    }
])

.controller('InboxCtrl', ['$scope', '$filter', 'ngTableParams', '$log',
    '$location',
    function MessageCtrl($scope, $filter, ngTableParams, $log, $location) {

        console.log('inside inboxctrl and showtable is true');
        $scope.showTable = true;

        $scope.showTableInbox = function () {
            console.log("inside showTableInbox");
            $scope.showTable = true;
        }

        $scope.openReplyBox = function(){
            $log.info("Inside replybox");
            
        }

        // Get Data from backend TODO

        var data = [{
            id: '1',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM'
        }, {
            id: '2',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM'
        }, {
            id: '3',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM'
        }, {
            id: '4',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM'
        }, {
            id: '5',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM'
        }, {
            id: '6',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM'
        }, {
            id: '7',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM'
        }, {
            id: '8',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM'
        }, {
            id: '9',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM'
        }, {
            id: '10',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM'
        }, {
            id: '11',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM'
        }, {
            id: '12',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM'
        }, {
            id: '13',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM'
        }, {
            id: '14',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM'
        }, {
            id: '15',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM'
        }, {
            id: '16',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM'
        }, {
            id: '17',
            name: 'Larro Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM'
        }];

        // Get Data from backend TODO

        $scope.messagebody =
            'Hi, Thanks for such an offer. I really appreciate it. Loerm Ipsum .......';



        $scope.showSelectedMail = function () {
            // console.log("inside selected mail");
            // $scope.showTable = false;
            $location.path('/messages/inbox/1');
        }


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
            visible: 'true'
        }, {
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
])

.controller('textAngularCtrl', ['$scope',
    function ($scope) {
        $scope.taRegisterTool = {
            textAngularEditors: {
                demo1: {
                    toolbar: [{
                        icon: "<i class='icon-code'></i>",
                        name: "html",
                        title: "Toggle Html"
                    }, {
                        icon: "h1",
                        name: "h1",
                        title: "H1"
                    }, {
                        icon: "h2",
                        name: "h2",
                        title: "H2"
                    }, {
                        icon: "pre",
                        name: "pre",
                        title: "Pre"
                    }, {
                        icon: "<i class='icon-bold'></i>",
                        name: "b",
                        title: "Bold"
                    }, {
                        icon: "<i class='icon-italic'></i>",
                        name: "i",
                        title: "Italics"
                    }, {
                        icon: "p",
                        name: "p",
                        title: "Paragraph"
                    }, {
                        icon: "<i class='icon-list-ul'></i>",
                        name: "ul",
                        title: "Unordered List"
                    }, {
                        icon: "<i class='icon-list-ol'></i>",
                        name: "ol",
                        title: "Ordered List"
                    }, {
                        icon: "<i class='icon-rotate-right'></i>",
                        name: "redo",
                        title: "Redo"
                    }, {
                        icon: "<i class='icon-undo'></i>",
                        name: "undo",
                        title: "Undo"
                    }, {
                        icon: "<i class='icon-ban-circle'></i>",
                        name: "clear",
                        title: "Clear"
                    }, {
                        icon: "<i class='icon-file'></i>",
                        name: "insertImage",
                        title: "Insert Image"
                    }, {
                        icon: "<i class='icon-html5'></i>",
                        name: "insertHtml",
                        title: "Insert Html"
                    }, {
                        icon: "<i class='icon-link'></i>",
                        name: "createLink",
                        title: "Create Link"
                    }],
                    html: "<h2>Try me!</h2><p>textAngular is a super cool WYSIWYG Text Editor directive for AngularJS</p><p><b>Features:</b></p><ol><li>Automatic Seamless Two-Way-Binding</li><li>Super Easy <b>Theming</b> Options</li><li>Simple Editor Instance Creation</li><li>Safely Parses Html for Custom Toolbar Icons</li><li>Doesn't Use an iFrame</li><li>Works with Firefox, Chrome, and IE10+</li></ol><p><b>Code at GitHub:</b> <a href='https://github.com/fraywing/textAngular'>Here</a> </p>",
                    disableStyle: false,
                    theme: {
                        editor: {
                            "font-family": "Roboto",
                            "font-size": "1.2em",
                            "border-radius": "4px",
                            "padding": "11px",
                            "background": "white",
                            "border": "1px solid rgba(2,2,2,0.1)"
                        },
                        insertFormBtn: {
                            "background": "red",
                            "color": "white",
                            "padding": "2px 3px",
                            "font-size": "15px",
                            "margin-top": "4px",
                            "border-radius": "4px",
                            "font-family": "Roboto",
                            "border": "2px solid red"
                        }
                    }
                }

            }
        };

        $scope.$watch('textAngularOpts.textAngularEditors.textArea2.html',
            function (val, newVal) {
                console.log(newVal);
            }, true);
    }
])

.controller('messageAutomateCtrl', ['$scope', '$location', 'segment',
    'queryMatching', '$filter',
    function ($scope, $location, segment, queryMatching, $filter) {
        $scope.automessages = ["In App welcome message for start ups",
            "Discount for users from Uganda", "As above", "As above1"
        ];


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

.controller('messageManualCtrl', ['$scope', '$location', 'segment',
    'queryMatching', '$filter',
    function ($scope, $location, segment, queryMatching, $filter) {


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

.controller('templateCtrl', ['$scope',
    function ($scope) {
        $scope.options = {
            color: ['Blue', 'Red', 'Green', 'Cyan']
        };
    }
])

.controller('MessageBodyCtrl', ['$scope',
    function ($scope) {
        // Get Data from Backend
        $scope.messages =
            'Hi, this is Larry Page. Thanks for such an offer. It was great.... Lorem Ipsum.......'
    }
]);