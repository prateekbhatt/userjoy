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
    'AppService', 'CurrentAppService',
    function ($scope, $location, segment, queryMatching, $filter,
        AutoMsgService, modelsAutomate, AppService, CurrentAppService) {

        CurrentAppService.getCurrentApp()
            .then(function (currentApp) {
                console.log("Promise resolved: ", currentApp);
                console.log("inside automate ctrl");

                $scope.showTable = false;

                $scope.activeMsg = '';


                var populateAutoMsg = function (err) {
                    $scope.automessages = [];
                    if (err) {
                        return err;
                    }

                    for (var i = 0; i < AutoMsgService.getAllAutoMsg()
                        .length; i++) {
                        var activeMessage = '';
                        if (AutoMsgService.getAllAutoMsg()[i].active) {
                            activeMessage = 'Deactivate';
                        } else {
                            activeMessage = 'Activate';
                        }
                        $scope.automessages.push({
                            title: AutoMsgService.getAllAutoMsg()[
                                i].title,
                            type: AutoMsgService.getAllAutoMsg()[i]
                                .type[0].toUpperCase() +
                                AutoMsgService.getAllAutoMsg()[i].type
                                .substring(
                                    1),
                            replied: AutoMsgService.getAllAutoMsg()[
                                i].replied,
                            sent: AutoMsgService.getAllAutoMsg()[i]
                                .sent,
                            seen: AutoMsgService.getAllAutoMsg()[i]
                                .seen,
                            clicked: AutoMsgService.getAllAutoMsg()[
                                i].clicked,
                            active: AutoMsgService.getAllAutoMsg()[
                                i].active,
                            id: AutoMsgService.getAllAutoMsg()[i]._id,
                            message: activeMessage
                        })

                    };
                    console.log($scope.automessages);
                    if ($scope.automessages.length > 0) {
                        $scope.showTable = true;
                    }

                }
                modelsAutomate.getAllAutoMessages(currentApp._id, populateAutoMsg);

                $scope.changeMsgStatus = function (id, text, index) {
                    if (text == 'Activate') {
                        modelsAutomate.makeMsgLive(AppService.getCurrentApp()
                            ._id, id);
                        // FIXME: The message should be changed to Deactivate when its a success. Have a callback for this.
                        $scope.automessages[index].message =
                            'Deactivate';
                    }

                    if (text == 'Deactivate') {
                        // FIXME: The message should be changed to Activate when its a success. Have a callback for this.
                        modelsAutomate.deActivateMsg(AppService.getCurrentApp()
                            ._id, id);
                        $scope.automessages[index].message =
                            'Activate';
                    }
                }

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

            })
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

.controller('textAngularCtrl', ['$scope', 'saveMsgService', '$location',
    'modelsAutomate', 'AppService', 'segmentService', 'ErrMsgService',
    function ($scope, saveMsgService, $location, modelsAutomate,
        AppService, segmentService, ErrMsgService) {
        console.log("inside text Angular Ctrl");
        console.log("sid: ", segmentService.getSingleSegment());
        $scope.showNotification = true;
        $scope.showEmail = false;
        $scope.showAutoMsgError = false;
        $scope.email = "savinay@dodatado.com";
        $scope.selectedMessageType = {
            icon: "fa fa-bell",
            value: "Notification"
        };
        console.log("selectedIcon: ", $scope.selectedMessageType);
        $scope.icons = [{
            value: "Notification",
            label: 'fa fa-bell'
        }, {
            value: "Email",
            label: 'fa fa-envelope'
        }];

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
                sid: segmentService.getSingleSegment()
                    .id
            }

            console.log("data: ", data);
            modelsAutomate.saveAutoMsg(AppService.getCurrentApp()
                ._id, data);
            $scope.$watch(ErrMsgService.getErrorMessage, function () {
                if (ErrMsgService.getErrorMessage()) {
                    $scope.showAutoMsgError = true;
                    $scope.errMsg = ErrMsgService.getErrorMessage();
                }
            })
        }

        $scope.showText = function (htmlVariable) {
            console.log($scope.htmlVariable);
        }

        $scope.hideErrorAlert = function () {
            $scope.showAutoMsgError = false;
        }


    }
])

.controller('testEmailCtrl', ['$scope', 'saveMsgService', 'modelsAutomate',
    'AppService', 'AutoMsgService',
    function ($scope, saveMsgService, modelsAutomate, AppService,
        AutoMsgService) {
        $scope.previewText = saveMsgService.getMsg();
        console.log(saveMsgService.getMsg());
        $scope.sendTestEmail = function () {
            modelsAutomate.sendTestEmail(AppService.getCurrentApp()
                ._id, AutoMsgService.getSingleAutoMsg()
                ._id);
        }
    }
])

.controller('liveEmailCtrl', ['$scope', 'saveMsgService', 'modelsAutomate',
    'AppService', 'AutoMsgService',
    function ($scope, saveMsgService, modelsAutomate, AppService,
        AutoMsgService) {
        $scope.preview = saveMsgService.getMsg();
        $scope.makeMsgLive = function () {
            modelsAutomate.makeMsgLive(AppService.getCurrentApp()
                ._id, AutoMsgService.getSingleAutoMsg()
                ._id);
        }
    }
])