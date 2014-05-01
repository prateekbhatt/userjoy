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
            .state('message.inbox', {
                url: '/inbox',
                views: {
                    "messageapp": {
                        templateUrl: '/templates/messagesmodule/message.inbox.html',
                        controller: 'InboxCtrl'
                    }
                },
                authenticate: true
            })
            .state('id', {
                url: '/messages/inbox/:messageId',
                views: {
                    "main": {
                        templateUrl: '/templates/messagesmodule/message.inbox.id.html',
                        controller: 'MessageBodyCtrl',
                    }
                },
                authenticate: true
            })
            .state('message.unread', {
                url: '/unread',
                views: {
                    "messageapp": {
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
            .state('message.automate', {
                url: '/compose/automate',
                views: {
                    "messageapp": {
                        templateUrl: '/templates/messagesmodule/message.compose.automate.html',
                        controller: 'messageAutomateCtrl',
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
            .state('message.write', {
                url: '/compose/automate/write',
                views: {
                    "messageapp": {
                        templateUrl: '/templates/messagesmodule/message.compose.automate.write.html',
                        controller: 'textAngularCtrl',
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

            });



    }
])

.controller('messageCtrl', ['$scope', '$location',
    function ($scope, $location) {

        // TODO : change in production
        if (window.location.href ===
            'http://app.do.localhost/messages') {
            $location.path('/messages/inbox');
        }

    }
])

.controller('InboxCtrl', ['$scope', '$filter', 'ngTableParams', '$log',
    'MsgService', '$location', 'AppService',
    function ($scope, $filter, ngTableParams, $log, MsgService, $location, AppService) {

        $scope.replytext = 'hello world';

        console.log('inside inboxctrl and showtable is true');
        $scope.showTable = true;

        $scope.showTableInbox = function () {
            console.log("inside showTableInbox");
            $scope.showTable = true;
        }



        // Get Data from backend TODO
        // TODO: Replace ng-table with normal table 
        var msg = MsgService.getManualMessage(AppService.getCurrentApp()
                ._id)

        console.log(msg);


        var data = [{
            id: '1',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            assign: 'Assign'
        }, {
            id: '2',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            assign: 'Assign'
        }, {
            id: '3',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            assign: 'Assign'
        }, {
            id: '4',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            assign: 'Assign'
        }, {
            id: '5',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            assign: 'Assign'
        }, {
            id: '6',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            assign: 'Assign'
        }, {
            id: '7',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            assign: 'Assign'
        }, {
            id: '8',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            assign: 'Assign'
        }, {
            id: '9',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            assign: 'Assign'
        }, {
            id: '10',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            assign: 'Assign'
        }, {
            id: '11',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            assign: 'Assign'
        }, {
            id: '12',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            assign: 'Assign'
        }, {
            id: '13',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            assign: 'Assign'
        }, {
            id: '14',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            assign: 'Assign'
        }, {
            id: '15',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            assign: 'Assign'
        }, {
            id: '16',
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            assign: 'Assign'
        }, {
            id: '17',
            name: 'Larro Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            assign: 'Assign'
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

.controller('UnreadCtrl', ['$scope', '$filter', 'ngTableParams',
    function ($scope, $filter, ngTableParams) {
        // TODO: Get data from backend
        // TODO: Replace ng-table with normal table
        var data = [{
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            reply: 'Reply',
            assign: 'Assign'
        }, {
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            reply: 'Reply',
            assign: 'Assign'
        }, {
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            reply: 'Reply',
            assign: 'Assign'
        }, {
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            reply: 'Reply',
            assign: 'Assign'
        }, {
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            reply: 'Reply',
            assign: 'Assign'
        }, {
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            reply: 'Reply',
            assign: 'Assign'
        }, {
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            reply: 'Reply',
            assign: 'Assign'
        }, {
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            reply: 'Reply',
            assign: 'Assign'
        }, {
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            reply: 'Reply',
            assign: 'Assign'
        }, {
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            reply: 'Reply',
            assign: 'Assign'
        }, {
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            reply: 'Reply',
            assign: 'Assign'
        }, {
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            reply: 'Reply',
            assign: 'Assign'
        }, {
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            reply: 'Reply',
            assign: 'Assign'
        }, {
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            reply: 'Reply',
            assign: 'Assign'
        }, {
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            reply: 'Reply',
            assign: 'Assign'
        }, {
            name: 'Larry Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            reply: 'Reply',
            assign: 'Assign'
        }, {
            name: 'Larro Page',
            subject: 'Hi, Thanks for such an offer. I really....',
            time: '3:29 PM',
            close: 'Close',
            reply: 'Reply',
            assign: 'Assign'
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
            title: '',
            field: 'close',
            visible: 'true'
        }, {
            title: '',
            field: 'reply',
            visible: 'true'
        }, {
            title: '',
            field: 'assign',
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
        $scope.showNotification = true;
        $scope.showEmail = false;
        $scope.email = "savinay@dodatado.com";
        $scope.selectedIcon = "Notification";
        console.log("selectedIcon: ", $scope.selectedIcon);
        $scope.icons = [{
            value: "Notification",
            label: '<i class="fa fa-bell"></i> Notification'
        }, {
            value: "Email",
            label: '<i class="fa fa-envelope"></i> Email'
        }]
        $scope.$watch('selectedIcon', function () {
            if ($scope.selectedIcon === "Notification") {
                $scope.showNotification = true;
                $scope.showEmail = false;
            }

            if ($scope.selectedIcon === "Email") {
                $scope.showNotification = false;
                $scope.showEmail = true;
            }
        })
        /*$scope.$watch('textAngularOpts.textAngularEditors.textArea2.html',
            function (val, newVal) {
                // console.log(newVal);
            }, true);*/
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

        $scope.healthScore = '50';
        $scope.plan = 'Basic';
        $scope.planValue = '$25';
        $scope.renewal = '25 Mar 2014';

        $scope.openReplyBox = function () {
            $log.info("Inside replybox");

        }

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

        $scope.replytext = '';

        $scope.today = new Date();

        // Get Data from Backend TODO
        $scope.messages = [{
            messagebody: 'Hi, this is Larry Page. Thanks for such an offer. It was great.... Lorem Ipsum.......',
            createdby: 'Savinay',
            createdat: '23rd March, 2014'
        }, {
            messagebody: 'Hi, this is Sergey Brin. Thanks for such an offer. It was great.... Lorem Ipsum.......cadilus quasum irium idler sherlock holmes',
            createdby: 'John',
            createdat: '24th March, 2014'
        }, {
            messagebody: 'Hi, this is Larry Page. Thanks for such an offer. It was great.... Lorem Ipsum.......',
            createdby: 'Savinay',
            createdat: '26th March, 2014'
        }, {
            messagebody: 'Hi, this is Sergey Brin. Thanks for such an offer. It was great.... Lorem Ipsum.......cadilus quasum irium idler sherlock holmes',
            createdby: 'John',
            createdat: '24th March, 2014'
        }, {
            messagebody: 'Hi, this is Larry Page. Thanks for such an offer. It was great.... Lorem Ipsum.......',
            createdby: 'Savinay',
            createdat: '26th March, 2014'
        }, {
            messagebody: 'Hi, this is Larry Page. Thanks for such an offer. It was great.... Lorem Ipsum.......',
            createdby: 'Savinay',
            createdat: '26th March, 2014'
        }, {
            messagebody: 'Hi, this is Larry Page. Thanks for such an offer. It was great.... Lorem Ipsum.......',
            createdby: 'Savinay',
            createdat: '26th March, 2014'
        }, {
            messagebody: 'Hi, this is Larry Page. Thanks for such an offer. It was great.... Lorem Ipsum.......',
            createdby: 'Jill',
            createdat: '26th March, 2014'
        }, {
            messagebody: 'Hi, this is Larry Page. Thanks for such an offer. It was great.... Lorem Ipsum.......',
            createdby: 'John',
            createdat: '26th March, 2014'
        }];

        /* function getUniqueUsers() {
            console.log("inside getcolor: ", name);
            var colorUser = _.chain($scope.messages)
                .pluck('createdby')
                .uniq()
                .map(function (by) {
                    return {
                        createdby: by,
                        color: getRandomColor(name.charAt(0))
                    }
                })
            console.log("colorUser: ", colorUser);
            return colorUsers;
        }*/

        $scope.messagesWithSrc = [];

        for (var i = 0; i < $scope.messages.length; i++) {
            console.log("value of i :");
            var imgsrc = '';
            var count = 0;
            var storedimgsrc = ''
            console.log("message object: ", $scope.messages[i]);
            var name = $scope.messages[i].createdby;
            var initials = name.charAt(0);
            var color = getRandomColor();
            for (var j = 0; j < i; j++) {
                console.log("i: ", i);
                // TODO : Get data from backend and match it based on uid
                if ($scope.messages[j].createdby == $scope.messages[i].createdby) {
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
                imgsrc = 'http://placehold.it/60/' + color + '/FFF&text=' +
                    initials;
                $scope.messagesWithSrc.push({
                    messagebody: $scope.messages[i].messagebody,
                    createdby: $scope.messages[i].createdby,
                    createdat: $scope.messages[i].createdat,
                    src: imgsrc
                })
            } else {
                $scope.messagesWithSrc.push({
                    messagebody: $scope.messages[i].messagebody,
                    createdby: $scope.messages[i].createdby,
                    createdat: $scope.messages[i].createdat,
                    src: storedimgsrc
                })
            }
            console.log("src generated: ", $scope.messagesWithSrc[i].src);
            console.log("with src: ", $scope.messagesWithSrc);
        };

        // TODO : Get data from backend and match it based on uid

        // $scope.user = '';
        $scope.user = 'Savinay';
        $scope.replysrc = '';

        for (var i = 0; i < $scope.messagesWithSrc.length; i++) {
            if ($scope.user == $scope.messagesWithSrc[i].createdby) {
                $scope.replysrc = $scope.messagesWithSrc[i].src;
                break;
            } else {
                var colorReply = getRandomColor();
                $scope.replysrc = 'http://placehold.it/60/' + colorReply +
                    '/FFF&text=' + $scope.user.charAt(0);
            }
        };

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

        $scope.showReplyButton = function () {
            $scope.insideReplyBox = true;
            console.log('inside show reply button');
            $scope.replytext = '';
            console.log($scope.replytext);
            $scope.buttontext = 'Close';
            /*if(!$scope.replytext.length){
                
                console.log('inside replytext length > 0');
            } else {
                $scope.buttontext = 'Close and Reply';
            }*/
        }

        $scope.changeButtonText = function () {
            // $scope.buttontext = 'Close and Reply';
            console.log("inside change button text");
            if ($scope.replytext.length > 0) {
                console.log('replytext length: ', $scope.replytext.length);
                $scope.showerror = false;
                $scope.buttontext = 'Close & Reply';
            } else {
                // $scope.showerror = true;
                $scope.buttontext = 'Close';
            }
        }

        $scope.deleteReply = function () {
            console.log('deleting text', $scope.replytext);
            // $scope.replytext = '';
            $scope.showerror = false;
            console.log('deleting text', $scope.replytext);
            $scope.buttontext = 'Close';
            $scope.insideReplyBox = false;
            $scope.replyButtonClicked = true;
        };

        $scope.validateAndAddReply = function () {
            console.log('reply text length is:', $scope.replytext.length);
            if (!$scope.replytext.length) {
                console.log('error in reply');
                $scope.showerror = true;
            }
            if ($scope.replytext.length > 0) {
                console.log("reply button clicked and validated");
                $scope.replyButtonClicked = true;
                $scope.replytextInDiv = $scope.replytext;
                $scope.replytext = '';
                $scope.replies.push({
                    body: $scope.replytextInDiv,
                    name: 'Savinay'
                })
                console.log('obejct of replies: ', $scope.replies);
                $scope.buttontext = 'Close';
                $scope.insideReplyBox = false;
            }
            console.log('validateReply', $scope.replytext);
        }

        $scope.closeTicket = function () {
            if ($scope.replytext.length > 0) {
                $scope.replyButtonClicked = true;
                $scope.replytextInDiv = $scope.replytext;
                $scope.replytext = '';
                $scope.replies.push({
                    body: $scope.replytextInDiv,
                    name: 'Savinay'
                })
            }
            $scope.buttontext = 'Reopen';

        }

        if (!$scope.replytext.length) {
            $scope.buttontext = 'Close';
        }

        if ($scope.replytext.length > 0) {
            console.log('reply length:', $scope.replytext.length);
            $scope.buttontext = 'Close & Reply';
        }

    }
]);
