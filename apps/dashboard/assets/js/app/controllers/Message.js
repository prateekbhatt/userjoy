angular.module('do.message', [])

.config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('message', {
                url: '/messages',
                views: {
                    "main": {
                        templateUrl: '/templates/messagesmodule/message.html',
                        controller: 'messageCtrl'
                    }
                },
                authenticate: true
            })
            .state('inbox', {
                url: '/messages/open/:id',
                views: {
                    "main": {
                        templateUrl: '/templates/messagesmodule/message.inbox.html',
                        controller: 'InboxCtrl'
                    }
                },
                authenticate: true
            })
            .state('id', {
                url: '/messages/:appId/conversations/:messageId',
                views: {
                    "main": {
                        templateUrl: '/templates/messagesmodule/message.inbox.id.html',
                        controller: 'MessageBodyCtrl',
                    }
                },
                authenticate: true
            })
            .state('unread', {
                url: '/messages/unread/:id',
                views: {
                    "main": {
                        templateUrl: '/templates/messagesmodule/message.unread.html',
                        controller: 'UnreadCtrl',
                    }
                },
                authenticate: true

            })
            .state('message.compose', {
                url: '/compose',
                views: {
                    "messageapp": {
                        templateUrl: '/templates/messagesmodule/message.compose.html',
                    }
                },
                authenticate: true

            })
            .state('message.manual', {
                url: '/compose/manual',
                views: {
                    "messageapp": {
                        templateUrl: '/templates/messagesmodule/message.compose.manual.html',
                        controller: 'messageManualCtrl',
                    }
                },
                authenticate: true

            })
            .state('message.template', {
                url: '/compose/template',
                views: {
                    "messageapp": {
                        templateUrl: '/templates/messagesmodule/message.compose.template.html',
                        controller: 'templateCtrl',
                    }
                },
                authenticate: true

            })
            .state('closed', {
                url: '/messages/closed/:id',
                views: {
                    "main": {
                        templateUrl: '/templates/messagesmodule/message.filter.closed.conversations.html',
                        controller: 'closedConversationCtrl',
                    }
                },
                authenticate: true

            })
    }
])

.controller('messageCtrl', ['$scope', '$location',
    function ($scope, $location) {

        console.log("inside home msg ctrl");

        // TODO : change in production
        if (window.location.href ===
            'http://app.do.localhost/messages') {
            $location.path('/messages/inbox');
        }

    }
])

.controller('InboxCtrl', ['$scope', '$filter', 'ngTableParams', '$log',
    'MsgService', '$location', 'AppService', 'InboxMsgService', '$moment',
    'login', '$timeout', '$rootScope', 'CurrentAppService',
    function ($scope, $filter, ngTableParams, $log, MsgService, $location,
        AppService, InboxMsgService, $moment, login, $timeout, $rootScope,
        CurrentAppService) {
        // console.log('Promise is now resolved: ' + CurrentAppService.getCurrentApp());

        CurrentAppService.getCurrentApp()
            .then(function (currentApp) {

                $scope.currApp = currentApp._id
                console.log("Promise Resolved: ", currentApp);
                console.log("loginProvider MsgCtrl:", login.getLoggedIn());
                $scope.showOpenConversations = true;
                console.log("entering inboxctrl");

                $scope.replytext = 'hello world';

                console.log('inside inboxctrl and showtable is true');
                $scope.showTable = true;

                $scope.showTableInbox = function () {
                    console.log("inside showTableInbox");
                    $scope.showTable = true;
                }

                // Get Data from backend TODO
                // console.log(AppService.getCurrentApp()
                //     ._id);
                var msg = [];

                function showManualMsg() {
                    $scope.openmsg = [];
                    msg = InboxMsgService.getInboxMessage();
                    if (!msg.length) {
                        $scope.showOpenConversations = false;
                    }
                    console.log("msg show Manual Msg: ", msg);
                    for (var i = 0; i < msg.length; i++) {
                        $scope.openmsg.push({
                            id: msg[i]._id,
                            name: msg[i].sName,
                            subject: msg[i].sub,
                            time: $moment(msg[i].ct)
                                .fromNow(),
                            close: 'Close',
                            assign: 'Assign',
                            coid: msg[i].coId
                        })
                    }
                    console.log("$scope.data: ", $scope.openmsg);
                    $scope.columnsInbox = [{
                        title: 'User',
                        field: 'name',
                        visible: true,
                        filter: {
                            'name': 'text'
                        }
                    }, {
                        title: 'Subject',
                        field: 'subject',
                        visible: true
                    }, {
                        title: 'When',
                        field: 'time',
                        visible: true
                    }, {
                        title: '',
                        field: 'close',
                        visible: true
                    }, {
                        title: '',
                        field: 'assign',
                        visible: true
                    }];

                    // $scope.refreshTable = function () {
                    //     $scope['tableParams'] = {
                    //         reload: function () {},
                    //         settings: function () {
                    //             return {}
                    //         }
                    //     };
                    //     $timeout(setTable, 100)
                    // };
                    // $scope.refreshTable();

                    // function setTable(arguments) {

                    //     $scope.tableParamsInbox = new ngTableParams({
                    //         page: 1, // show first page
                    //         count: 10, // count per page
                    //         filter: {
                    //             name: '' // initial filter
                    //         },
                    //         sorting: {
                    //             name: 'asc'
                    //         }
                    //     }, {
                    //         filterSwitch: true,
                    //         total: $scope.openmsg.length, // length of data
                    //         getData: function ($defer, params) {
                    //             var orderedData = params.sorting() ?
                    //                 $filter('orderBy')($scope.openmsg,
                    //                     params.orderBy()) :
                    //                 $scope.openmsg;
                    //             params.total(orderedData.length);
                    //             $defer.resolve(orderedData.slice((params.page() -
                    //                     1) * params.count(), params.page() *
                    //                 params.count()));
                    //         }
                    //     });
                    // }

                    $scope.tableParamsInbox = new ngTableParams({
                        page: 1, // show first page
                        count: 10 // count per page
                    }, {
                        total: $scope.openmsg.length, // length of data
                        getData: function ($defer, params) {
                            // use build-in angular filter
                            // var filteredData = params.filter() ?
                            //     $filter('filter')($scope.data, params
                            //         .filter()) :
                            //     $scope.data;
                            // var orderedData = params.sorting() ?
                            //     $filter('orderBy')($scope.data,
                            //         params.orderBy()) :
                            //     $scope.data;
                            // params.total(orderedData.length); // set total for recalc paginationemail

                            $defer.resolve($scope.openmsg.slice((
                                    params.page() -
                                    1) * params.count(),
                                params.page() *
                                params.count()));
                        }
                    });
                }

                var showMsgCallback = function (err) {
                    if (err) {
                        return;
                    }
                    showManualMsg();
                }
                var currentAppId = AppService.getCurrentApp()
                    ._id;
                MsgService.getManualMessage(currentApp._id,
                    showMsgCallback);

                console.log("msg: ", $scope.openmsg);


                $scope.showMessageThread = function (index) {
                    console.log("index: ", index);
                    console.log(InboxMsgService.getInboxMessage());
                }

                $scope.closeConversation = function (coId, user, index) {
                    MsgService.closeConversationRequest(AppService.getCurrentApp()
                        ._id, coId, function (err, user) {
                            console.log("coid: ", coId, $scope.openmsg);
                            if (err) {
                                console.log("error");
                                return;
                            }
                            console.log("index: ", index);
                            $scope.openmsg.splice(index, 1);
                            $scope.tableParamsInbox.reload();
                            console.log("closing open conversation: ",
                                InboxMsgService.getInboxMessage()
                                .length);
                            if (InboxMsgService.getInboxMessage()
                                .length == 1) {
                                $scope.showOpenConversations = false;
                            }
                        });
                }


                // Get Data from backend TODO

                $scope.messagebody =
                    'Hi, Thanks for such an offer. I really appreciate it. Loerm Ipsum .......';



                $scope.showSelectedMail = function (id) {
                    $location.path('/messages/' + AppService.getCurrentApp()
                        ._id + '/conversations/' + id);


                }

            })

        // 

    }
])

.controller('UnreadCtrl', ['$scope', '$filter', 'ngTableParams', 'AppService',
    '$moment', 'MsgService', 'InboxMsgService', '$location', '$timeout',
    'CurrentAppService',
    function ($scope, $filter, ngTableParams, AppService, $moment,
        MsgService, InboxMsgService, $location, $timeout,
        CurrentAppService) {

        CurrentAppService.getCurrentApp()
            .then(function (currentApp) {
                $scope.currApp = currentApp._id
                console.log("Promise Resolved: ", currentApp);
                $scope.showUnreadMsgs = true;

                console.log("inside UnreadCtrl");
                $scope.unreadmsg = [];
                var msg = [];
                var populateUnreadMsg = function () {
                    msg = InboxMsgService.getUnreadMessage();
                    console.log("unread msgs ---> ", msg);
                    if (!msg.length) {
                        $scope.showUnreadMsgs = false;
                    }

                    for (var i = 0; i < msg.length; i++) {
                        $scope.unreadmsg.push({
                            id: msg[i]._id,
                            name: msg[i].sName,
                            subject: msg[i].sub,
                            time: $moment(msg[i].ct)
                                .fromNow(),
                            close: 'Close',
                            assign: 'Assign',
                            coid: msg[i].coId
                        })
                    };

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
                        title: '',
                        field: 'close',
                        visible: 'true'
                    }, {
                        title: '',
                        field: 'assign',
                        visible: 'true'
                    }];

                    $scope.refreshTable = function () {
                        $scope['tableParams'] = {
                            reload: function () {},
                            settings: function () {
                                return {}
                            }
                        };
                        $timeout(setTable, 100)
                    };
                    $scope.refreshTable();

                    function setTable(arguments) {

                        $scope.tableParamsSent = new ngTableParams({
                            page: 1, // show first page
                            count: 10, // count per page
                            filter: {
                                name: '' // initial filter
                            },
                            sorting: {
                                name: 'asc'
                            }
                        }, {
                            filterSwitch: true,
                            total: $scope.unreadmsg.length, // length of data
                            getData: function ($defer, params) {
                                var orderedData = params.sorting() ?
                                    $filter('orderBy')($scope.unreadmsg,
                                        params.orderBy()) :
                                    $scope.unreadmsg;
                                params.total(orderedData.length);
                                $defer.resolve(orderedData.slice((
                                        params.page() -
                                        1) * params.count(),
                                    params.page() *
                                    params.count()));
                            }
                        });
                    }

                }

                var showUnreadMsgCallBack = function (err) {
                    if (err) {
                        return err;
                    }
                    populateUnreadMsg();
                }



                MsgService.getUnreadMessages(currentApp._id,
                    showUnreadMsgCallBack);

                $scope.closeConversation = function (coId) {
                    MsgService.closeConversationRequest(AppService.getCurrentApp()
                        ._id, coId);
                }

                $scope.showSelectedMail = function (id) {
                    $location.path('/messages/' + AppService.getCurrentApp()
                        ._id + '/conversations/' + id);
                }

            })

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
        console.log("inside templateCtrl");
        $scope.options = {
            color: ['Blue', 'Red', 'Green', 'Cyan']
        };
    }
])

.controller('MessageBodyCtrl', ['$scope', 'MsgService', 'AppService',
    'ThreadService', '$moment', 'InboxMsgService', 'AccountService',
    '$log',
    function ($scope, MsgService, AppService, ThreadService, $moment,
        InboxMsgService, AccountService, $log) {


        console.log(AccountService.get());

        function getRandomColor(initials) {
            var letters = '0123456789ABCDEF'.split('');
            var color = '';
            // var imgsrc = '';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            // imgsrc = 'http://placehold.it/60/' + color + '/FFF&text=' +
            //     initials;
            return color;
        }

        function setMessagesIntoScope() {
            var msgThread = [];
            msgThread = ThreadService.getThread();
            console.log("msg is closed: ", msgThread.closed);
            if (msgThread.closed) {
                console.log("buttontext: Reopen");
                $scope.buttontext = 'Reopen';
            } else {
                console.log("buttontext: Close");
                $scope.buttontext = 'Close';
            }
            console.log("msg thread: -> ->", msgThread);
            for (var i = 0; i < msgThread.messages.length; i++) {
                var isSeen = false;
                if (msgThread.messages[i].seen && msgThread.messages[i].from ==
                    'account') {
                    isSeen = true;
                }
                $scope.messages.push({
                    messagebody: msgThread.messages[i].text,
                    createdby: msgThread.messages[i].sName,
                    createdat: $moment(msgThread.messages[i].ut)
                        .fromNow(),
                    seen: isSeen
                })
            };
        }

        function setAvatarColors() {

            for (var i = 0; i < $scope.messages.length; i++) {
                console.log("value of i :");
                var imgsrc = '';
                var count = 0;
                var storedimgsrc = '';
                console.log("message object: ", $scope.messages[i]);
                var name = $scope.messages[i].createdby;
                var initials = name.charAt(0);
                var color = getRandomColor();
                for (var j = 0; j < i; j++) {
                    console.log("i: ", i);
                    // TODO : Get data from backend and match it based on uid
                    if ($scope.messages[j].createdby == $scope.messages[i]
                        .createdby) {
                        count++;
                        storedimgsrc = $scope.messagesWithSrc[j].src;
                        break;
                    }
                }

                console.log("storedimgsrc: ", storedimgsrc);
                /*if(count == 1) {
                imgsrc = $scope.messagesWithSrc[i].src;
            }*/

                if (count < 1) {
                    imgsrc = 'http://placehold.it/60/' + color +
                        '/FFF&text=' +
                        initials;
                    $scope.messagesWithSrc.push({
                        messagebody: $scope.messages[i].messagebody,
                        createdby: $scope.messages[i].createdby,
                        createdat: $scope.messages[i].createdat,
                        src: imgsrc,
                        seen: $scope.messages[i].seen
                    })
                } else {
                    $scope.messagesWithSrc.push({
                        messagebody: $scope.messages[i].messagebody,
                        createdby: $scope.messages[i].createdby,
                        createdat: $scope.messages[i].createdat,
                        src: storedimgsrc,
                        seen: $scope.messages[i].seen
                    })
                }
                console.log("src generated: ", $scope.messagesWithSrc[i].src);
                console.log("with src: ", $scope.messagesWithSrc);
            };

            $scope.replysrc = '';
            console.log("USer loggedin: ", AccountService.get());
            $scope.user = AccountService.get()
                .name;

            for (var i = 0; i < $scope.messagesWithSrc.length; i++) {
                if ($scope.user == $scope.messagesWithSrc[i].createdby) {
                    $scope.replysrc = $scope.messagesWithSrc[i].src;
                    break;
                } else {
                    var colorReply = getRandomColor();
                    $scope.replysrc = 'http://placehold.it/60/' +
                        colorReply +
                        '/FFF&text=' + $scope.user.charAt(0);
                }
            };
        }


        $scope.healthScore = '50';
        $scope.plan = 'Basic';
        $scope.planValue = '$25';
        $scope.renewal = '25 Mar 2014';

        $scope.openReplyBox = function () {
            $log.info("Inside replybox");
        };

        $scope.replytext = '';
        $scope.today = $moment(new Date())
            .fromNow();
        $scope.messages = [];
        $scope.messagesWithSrc = [];

        // Get Data from Backend TODO

        var pathArray = window.location.pathname.split('/');
        var appId = pathArray[2];
        console.log(appId);
        var coId = pathArray[4];

        var msgServiceCallback = function (err) {
            if (err) return $log.error(err);
            setMessagesIntoScope();
            setAvatarColors();
            console.log("$scope.messages: ", $scope.messages);
        };

        MsgService.getMessageThread(appId, coId, msgServiceCallback);




        // TODO : Get data from backend and match it based on uid

        $scope.customer = 'John';
        $scope.custsrc = '';

        for (var i = 0; i < $scope.messagesWithSrc.length; i++) {
            if ($scope.customer == $scope.messagesWithSrc[i].createdby) {
                $scope.custsrc = $scope.messagesWithSrc[i].src;
                break;
            } else {
                var colorReply = getRandomColor();
                $scope.custsrc = 'http://placehold.it/60/' + colorReply +
                    '/FFF&text=' + $scope.user.charAt(0);
            }
        };


        $scope.replies = [];

        $scope.replyButtonClicked = false;

        var closeButtonClicked = false;

        var lengthReply = $scope.replytext.length;

        $scope.changeButtonText = function () {
            if (!ThreadService.getThread()
                .closed) {
                if ($scope.replytext.length > 0) {
                    $scope.showerror = false;
                    $scope.buttontext = 'Close & Reply';
                }
                if ($scope.replytext.length == 0) {
                    $scope.buttontext = 'Close';
                }
            } else {
                if ($scope.replytext.length > 0) {
                    $scope.showerror = false;
                    $scope.buttontext = 'Reopen & Reply';
                }
                if ($scope.replytext.length == 0) {
                    $scope.buttontext = 'Reopen';
                }
            }
        }

        var replyCallBack = function (err) {
            if (err) {
                console.log("error");
                return;
            }
            if (ThreadService.getReply) {
                $scope.replytextInDiv = $scope.replytext;
                $scope.replytext = '';
                $scope.replies.push({
                    body: $scope.replytextInDiv
                })
            }


        }

        var closeOrReopenReplyCallBack = function (err) {
            if (err) {
                console.log("error");
                return;
            }
            if (ThreadService.getReply) {
                $scope.replytextInDiv = $scope.replytext;
                $scope.replytext = '';
                console.log("pushing msg");
                $scope.replies.push({
                    body: $scope.replytextInDiv
                })
                console.log('object of replies: ', $scope.replies);
                $scope.insideReplyBox = false;
                console.log('validateReply', $scope.replytext);

                if (!ThreadService.getThread()
                    .closed) {
                    MsgService.closeConversationRequest(AppService.getCurrentApp()
                        ._id, coId, function (err, user) {
                            if (err) {
                                console.log("error");
                                return;
                            }
                            console.log("changing button text to reopen");
                            $scope.buttontext = 'Reopen';
                        });
                } else {
                    MsgService.reopenConversation(AppService.getCurrentApp()
                        ._id, coId, function (err, user) {
                            if (err) {
                                console.log("error");
                                return;
                            }
                            console.log("changing buttontext to close");
                            $scope.buttontext = 'Close';
                        });
                }

            }
        }

        $scope.validateAndAddReply = function () {
            var coId = '';
            // var msglength = InboxMsgService.getInboxMessage().length;
            coId = pathArray[4];
            console.log('reply text length is:', $scope.replytext.length);
            if (!$scope.replytext.length) {
                console.log('error in reply');
                $scope.showerror = true;
                return;
            }
            if ($scope.replytext.length > 0) {
                console.log("reply button clicked and validated");
                $scope.replyButtonClicked = true;
                MsgService.replyToMsg(AppService.getCurrentApp()
                    ._id, coId, $scope.replytext, AccountService.get()
                    ._id, replyCallBack);

            }
        }

        $scope.closeTicket = function () {
            closeButtonClicked = true;

            if (!ThreadService.getThread()
                .closed) {

                if ($scope.replytext.length > 0) {
                    $scope.replyButtonClicked = true;
                    $scope.replytextInDiv = $scope.replytext;
                    MsgService.replyToMsg(AppService.getCurrentApp()
                        ._id, coId, $scope.replytextInDiv, AccountService.get()
                        ._id, closeOrReopenReplyCallBack);
                } else {
                    MsgService.closeConversationRequest(AppService.getCurrentApp()
                        ._id, coId, function (err, user) {
                            if (err) {
                                console.log("error");
                                return;
                            }
                            console.log("changing button text to reopen");
                            $scope.buttontext = 'Reopen';
                        });
                }

            } else {
                if ($scope.replytext.length > 0) {
                    $scope.replyButtonClicked = true;
                    $scope.replytextInDiv = $scope.replytext;
                    MsgService.replyToMsg(AppService.getCurrentApp()
                        ._id, coId, $scope.replytextInDiv,
                        AccountService.get()
                        ._id, closeOrReopenReplyCallBack);
                } else {
                    MsgService.reopenConversation(AppService.getCurrentApp()
                        ._id, coId, function (err, user) {
                            if (err) {
                                console.log("error");
                                return;
                            }
                            console.log("changing buttontext to close");
                            $scope.buttontext = 'Close';
                        });
                }


            }
        }

    }
])

.controller('closedConversationCtrl', ['$scope', 'MsgService',
    'AppService',
    'InboxMsgService', '$moment', '$filter', 'ngTableParams',
    '$log',
    '$location', '$timeout', 'CurrentAppService',
    function ($scope, MsgService, AppService, InboxMsgService,
        $moment,
        $filter, ngTableParams, $log, $location, $timeout,
        CurrentAppService) {

        CurrentAppService.getCurrentApp()
            .then(function (currentApp) {
                console.log("Promise Resolved: ", currentApp);
                $scope.currApp = currentApp._id;
                console.log("inside closedConversationCtrl");
                $scope.showClosedConversations = true;
                var msg = [];

                function showClosedMsg() {
                    $scope.closedmsg = [];
                    msg = InboxMsgService.getClosedMessage();
                    if (!msg.length) {
                        $scope.showClosedConversations = false;
                    }
                    console.log("msg show Closed Msg -> -> ", msg);
                    for (var i = 0; i < msg.length; i++) {
                        $scope.closedmsg.push({
                            id: msg[i]._id,
                            name: msg[i].sName,
                            subject: msg[i].sub,
                            time: $moment(msg[i].ct)
                                .fromNow()
                        })
                    }
                    console.log("$scope.data: ", $scope.closedmsg);
                    $scope.columnsClosed = [{
                        title: 'User',
                        field: 'name',
                        visible: true,
                        filter: {
                            'name': 'text'
                        }
                    }, {
                        title: 'Subject',
                        field: 'subject',
                        visible: true
                    }, {
                        title: 'When',
                        field: 'time',
                        visible: true
                    }];

                    $scope.refreshTable = function () {
                        $scope['tableParams'] = {
                            reload: function () {},
                            settings: function () {
                                return {}
                            }
                        };
                        $timeout(setTable, 100)
                    };
                    $scope.refreshTable();

                    function setTable(arguments) {

                        $scope.tableParamsClosed = new ngTableParams({
                            page: 1, // show first page
                            count: 10, // count per page
                            filter: {
                                name: '' // initial filter
                            },
                            sorting: {
                                name: 'asc'
                            }
                        }, {
                            filterSwitch: true,
                            total: $scope.closedmsg.length, // length of data
                            getData: function ($defer, params) {
                                var orderedData = params.sorting() ?
                                    $filter('orderBy')($scope.closedmsg,
                                        params.orderBy()) :
                                    $scope.closedmsg;
                                params.total(orderedData.length);
                                $defer.resolve(orderedData.slice((
                                        params.page() -
                                        1) * params.count(),
                                    params.page() *
                                    params.count()));
                            }
                        });
                    }
                }

                var showClosedMsgCallback = function (err) {
                    if (err) {
                        return;
                    }
                    showClosedMsg();
                }

                MsgService.getClosedConversations(currentApp._id,
                    showClosedMsgCallback);

                $scope.showClosedConversations = function (id) {
                    $location.path('/messages/' + AppService.getCurrentApp()
                        ._id + '/conversations/' + id);


                }

            })
    }
]);