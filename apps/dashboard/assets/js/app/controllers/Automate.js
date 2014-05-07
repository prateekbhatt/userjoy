angular.module('do.automate', [])

.config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('automate', {
                url: '/messages/automate',
                views: {
                    "main": {
                        templateUrl: '/templates/messagesmodule/message.compose.automate.html',
                        controller: 'messageAutomateCtrl',
                    }
                },
                authenticate: true

            })
            .state('automateSegment', {
                url: '/messages/automate/segment',
                views: {
                    "main": {
                        templateUrl: '/templates/messagesmodule/message.automate.segment.html',
                        controller: 'automateSegmentCtrl',
                    }
                },
                authenticate: true

            })
            .state('automateWrite', {
                url: '/messages/automate/write',
                views: {
                    "main": {
                        templateUrl: '/templates/messagesmodule/message.compose.automate.write.html'
                    }
                },
                authenticate: true

            })
            .state('automateTest', {
                url: '/messages/automate/test',
                views: {
                    "main": {
                        templateUrl: '/templates/messagesmodule/message.automate.test.email.html',
                        controller: 'testEmailCtrl',
                    }
                },
                authenticate: true

            })
            .state('automateLive', {
                url: '/messages/automate/live',
                views: {
                    "main": {
                        templateUrl: '/templates/messagesmodule/message.automate.live.html',
                        controller: 'liveEmailCtrl',
                    }
                },
                authenticate: true

            })
    }
])

.controller('messageAutomateCtrl', ['$scope', '$location', 'segment',
    'queryMatching', '$filter',
    function ($scope, $location, segment, queryMatching, $filter) {

        console.log("inside automate ctrl");

        $scope.automessages = ["In App welcmessageAutomateCtrlome message for start ups",
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

.controller('automateSegmentCtrl', ['$scope', 'segment',
    function ($scope, segment) {
        $scope.segments = segment.get.all();
        $scope.segmenticons = [];
        $scope.selectedIcon = $scope.segments[0].name;

        for (var i = $scope.segments.length - 1; i >= 0; i--) {
            $scope.segmenticons.push({
                value: $scope.segments[i].name,
                label: $scope.segments[i].name
            })
        };
    }
])

.controller('textAngularCtrl', ['$scope', 'saveMsgService', '$location',
    function ($scope, saveMsgService, $location) {
        console.log("inside text Angular Ctrl")
        $scope.showNotification = true;
        $scope.showEmail = false;
        $scope.email = "savinay@dodatado.com";
        $scope.selectedMessageType = {
            icon: "fa fa-bell",
            value: "Notification"
        };
        /*$scope.text = '';
        $scope.htmlVariable = {
            text: 'Hello World'
        };*/
        // $scope.selectedMessageType = "Notification";
        console.log("selectedIcon: ", $scope.selectedMessageType);
        $scope.icons = [{
            value: "Notification",
            label: 'fa fa-bell'
        }, {
            value: "Email",
            label: 'fa fa-envelope'
        }];

        // $scope.htmlVariable = 'HelloWorld';

        $scope.changeBtnText = function (index) {
            $scope.selectedMessageType.value = $scope.icons[
                index].value;
            $scope.selectedMessageType.icon = $scope.icons[
                index].label;
            if ($scope.selectedMessageType.value ===
                "Notification") {
                $scope.showNotification = true;
                $scope.showEmail = false;
            }

            if ($scope.selectedMessageType.value === "Email") {
                $scope.showNotification = false;
                $scope.showEmail = true;
            }
        }

        $scope.saveMessage = function () {
            if($scope.htmlVariable) {
                $location.path('/messages/automate/test');
                saveMsgService.setMsg($scope.htmlVariable);
            }
            console.log("htmlVariable: ", $scope.htmlVariable);
        }
        // $scope.text = $scope.htmlVariable.text;
        $scope.showText = function (htmlVariable) {
            console.log($scope.htmlVariable);
        }


    }
])

.controller('testEmailCtrl', ['$scope', 'saveMsgService',
    function ($scope, saveMsgService) {
        $scope.previewText = saveMsgService.getMsg();
        console.log(saveMsgService.getMsg());
    }
])

.controller('liveEmailCtrl', ['$scope', 'saveMsgService',
    function ($scope, saveMsgService) {
        $scope.preview = saveMsgService.getMsg();
    }
])