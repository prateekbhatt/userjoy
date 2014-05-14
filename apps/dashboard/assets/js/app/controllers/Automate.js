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
    'queryMatching', '$filter', 'AutoMsgService', 'modelsAutomate',
    'AppService',
    function ($scope, $location, segment, queryMatching, $filter,
        AutoMsgService, modelsAutomate, AppService) {

        console.log("inside automate ctrl");

        var populateAutoMsg = function (err) {
            if (err) {
                return err;
            }
            console.log("success");
        }
        modelsAutomate.getAllAutoMessages(AppService.getCurrentApp()
            ._id, populateAutoMsg);

        $scope.automessages = [
            "In App welcmessageAutomateCtrlome message for start ups",
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

.controller('automateSegmentCtrl', ['$scope', 'segment', 'modelsSegment',
    'AppService', 'segmentService',
    function ($scope, segment, modelsSegment, AppService, segmentService) {

        $scope.segments = [];
        $scope.segmenticons = [];
        $scope.selectedIcon = [];


        var checkSegments = function (err) {
            if (err) {
                return err;
            }
            $scope.selectedIcon.id = segmentService.getSegments()[0]._id;
            $scope.selectedIcon.name = segmentService.getSegments()[0].name;
            if (segmentService.getSegments()
                .length > 0) {
                for (var i = 0; i < segmentService.getSegments()
                    .length; i++) {
                    $scope.segmenticons.push({
                        value: segmentService.getSegments()[i].name,
                        label: segmentService.getSegments()[i].name,
                        id: segmentService.getSegments()[i]._id
                    })
                };
            }
        }

        modelsSegment.getAllSegments(AppService.getCurrentApp()
            ._id, checkSegments);
        $scope.changeText = function (ind) {
            $scope.selectedIcon.id = $scope.segmenticons[ind].id;
            $scope.selectedIcon.name = $scope.segmenticons[ind].label;
        }

        $scope.storeSegment = function () {
            segmentService.setSingleSegment($scope.selectedIcon);
            console.log("single segment: ", segmentService.getSingleSegment());
        }
    }
])

.controller('textAngularCtrl', ['$scope', 'saveMsgService', '$location', 'modelsAutomate', 'AppService', 'segmentService',
    function ($scope, saveMsgService, $location, modelsAutomate, AppService, segmentService) {
        console.log("inside text Angular Ctrl");
        console.log("sid: ", segmentService.getSingleSegment());
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
            if ($scope.showNotification) {
                saveMsgService.setMsg($scope.notificationBody);
                saveMsgService.setTitle($scope.title);
            }

            if ($scope.showEmail) {
                saveMsgService.setMsg($scope.emailBody);
                saveMsgService.setSub($scope.subject);
                saveMsgService.setTitle($scope.title);
                console.log("email body: ", saveMsgService.getMsg());
                console.log("email subject: ", saveMsgService.getSub());
                // console.log("msg: ",saveMsgService)
            }

            var data = {
                body: saveMsgService.getMsg(),
                sub: saveMsgService.getSub(),
                title: saveMsgService.getTitle(),
                type: $scope.selectedMessageType.value.toLowerCase(),
                sid: segmentService.getSingleSegment().id
            }

            console.log("data: ", data);
            modelsAutomate.saveAutoMsg(AppService.getCurrentApp()._id, data);
        }

        $scope.showText = function (htmlVariable) {
            console.log($scope.htmlVariable);
        }


    }
])

.controller('testEmailCtrl', ['$scope', 'saveMsgService', 'modelsAutomate', 'AppService', 'AutoMsgService',
    function ($scope, saveMsgService, modelsAutomate, AppService, AutoMsgService) {
        $scope.previewText = saveMsgService.getMsg();
        console.log(saveMsgService.getMsg());
        $scope.sendTestEmail = function () {
            modelsAutomate.sendTestEmail(AppService.getCurrentApp()._id, AutoMsgService.getSingleAutoMsg()._id);
        }
    }
])

.controller('liveEmailCtrl', ['$scope', 'saveMsgService', 'modelsAutomate', 'AppService', 'AutoMsgService',
    function ($scope, saveMsgService, modelsAutomate, AppService, AutoMsgService) {
        $scope.preview = saveMsgService.getMsg();
        $scope.makeMsgLive = function () {
            modelsAutomate.makeMsgLive(AppService.getCurrentApp()._id, AutoMsgService.getSingleAutoMsg()._id);
        }
    }
])