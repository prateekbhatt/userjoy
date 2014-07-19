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
        url: '/apps/:id/messages/open',
        views: {
          "main": {
            templateUrl: '/templates/messagesmodule/message.inbox.html',
            controller: 'InboxCtrl'
          }
        },
        authenticate: true
      })
      .state('id', {
        url: '/apps/:id/messages/conversations/:messageId',
        views: {
          "main": {
            templateUrl: '/templates/messagesmodule/message.inbox.id.html',
            controller: 'MessageBodyCtrl',
          }
        },
        authenticate: true
      })
      .state('unread', {
        url: '/apps/:id/messages/unread',
        views: {
          "main": {
            templateUrl: '/templates/messagesmodule/message.unread.html',
            controller: 'UnreadCtrl',
          }
        },
        authenticate: true

      })
      .state('message.compose', {
        url: '/apps/:id/compose',
        views: {
          "messageapp": {
            templateUrl: '/templates/messagesmodule/message.compose.html',
          }
        },
        authenticate: true

      })
      .state('message.manual', {
        url: '/apps/:id/compose/manual',
        views: {
          "messageapp": {
            templateUrl: '/templates/messagesmodule/message.compose.manual.html',
            controller: 'messageManualCtrl',
          }
        },
        authenticate: true

      })
      .state('message.template', {
        url: '/apps/:id/compose/template',
        views: {
          "messageapp": {
            templateUrl: '/templates/messagesmodule/message.compose.template.html',
            controller: 'templateCtrl',
          }
        },
        authenticate: true

      })
      .state('closed', {
        url: '/apps/:id/messages/closed',
        views: {
          "main": {
            templateUrl: '/templates/messagesmodule/message.filter.closed.conversations.html',
            controller: 'closedConversationCtrl',
          }
        },
        authenticate: true

      })
      .state('goodhealth', {
        url: '/apps/:id/messages/goodhealth',
        views: {
          "main": {
            templateUrl: '/templates/messagesmodule/messages.filter.goodhealth.html',
            controller: 'goodHealthConversationCtrl',
          }
        },
        authenticate: true

      })
      .state('averagehealth', {
        url: '/apps/:id/messages/avghealth',
        views: {
          "main": {
            templateUrl: '/templates/messagesmodule/messages.filter.avghealth.html',
            controller: 'avgHealthConversationCtrl',
          }
        },
        authenticate: true

      })
      .state('poorhealth', {
        url: '/apps/:id/messages/poorhealth',
        views: {
          "main": {
            templateUrl: '/templates/messagesmodule/messages.filter.badhealth.html',
            controller: 'poorHealthConversationCtrl',
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
    /*if (window.location.href ===
            'http://app.do.localhost/messages') {
            $location.path('/messages/inbox');
        }*/

  }
])

.controller('InboxCtrl', ['$scope', '$filter', 'ngTableParams', '$log',
  'MsgService', '$location', 'AppService', 'InboxMsgService', '$moment',
  'login', '$timeout', '$rootScope', 'CurrentAppService', '$stateParams',
  'AppModel',
  function ($scope, $filter, ngTableParams, $log, MsgService, $location,
    AppService, InboxMsgService, $moment, login, $timeout, $rootScope,
    CurrentAppService, $stateParams, AppModel) {
    // console.log('Promise is now resolved: ' + CurrentAppService.getCurrentApp());

    CurrentAppService.getCurrentApp()
      .then(function (currentApp) {

        $scope.currApp = $stateParams.id;
        console.log("Promise Resolved: ", currentApp);
        console.log("loginProvider MsgCtrl:", login.getLoggedIn());
        $scope.showOpenConversations = true;
        console.log("entering inboxctrl");

        $scope.replytext = 'hello world';

        console.log('inside inboxctrl and showtable is true');
        $scope.showTable = true;

        if ($scope.currApp == null) {
          $scope.currApp = currentApp[0]._id
        }

        $scope.isActive = function (path) {
          var location = $location.path()
            .split('/')[4];
          return path == location;
        }

        var populatePage = function () {
          $scope.showTableInbox = function () {
            console.log("inside showTableInbox");
            $scope.showTable = true;
          }

          $scope.goToOpenMsg = function () {
            $location.path('/apps/' + $stateParams.id + '/messages/open');
          }

          $scope.goToUnreadMsg = function () {
            $location.path('/apps/' + $stateParams.id + '/messages/unread');
          }

          $scope.goToClosedMsg = function () {
            $location.path('/apps/' + $stateParams.id + '/messages/closed');
          }

          $scope.goToGoodHealth = function () {
            $location.path('/apps/' + $stateParams.id +
              '/messages/goodhealth');
          }

          $scope.goToAvgHealth = function () {
            $location.path('/apps/' + $stateParams.id +
              '/messages/avghealth');
          }

          $scope.goToPoorHealth = function () {
            $location.path('/apps/' + $stateParams.id +
              '/messages/poorhealth');
          }

          $scope.pageNo = '';
          $scope.pageCount = '';

          var msg = [];

          function showManualMsg() {
            $scope.openmsg = [];
            msg = InboxMsgService.getInboxMessage();
            if (!msg.length) {
              $scope.showOpenConversations = false;
            }

            for (var i = 0; i < msg.length; i++) {

              var m = {
                id: msg[i]._id,
                name: msg[i].uid.email,
                subject: msg[i].sub,
                time: $moment(msg[i].ct)
                  .fromNow(),
                close: 'Close',
                coid: msg[i].coId
              };

              var assignee = msg[i].assignee || {};

              if (assignee.name) {
                m.assign = 'Assigned to ' + assignee.name;
              } else if (assignee.email) {
                m.assign = 'Assigned to ' + assignee.email;
              } else {
                m.assign = 'Assign';
              }

              $scope.openmsg.push(m);
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

            $scope.tableParamsInbox = new ngTableParams({
              page: 1, // show first page
              count: 10 // count per page
            }, {
              total: $scope.openmsg.length, // length of data
              getData: function ($defer, params) {
                $scope.pageNo = params.page();
                $scope.pageCount = params.count();
                console.log("page No page Count: ", $scope.pageNo,
                  $scope.pageCount);
                $defer.resolve($scope.openmsg.slice(
                  (
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
          MsgService.getManualMessage($scope.currApp,
            showMsgCallback);

          console.log("msg: ", $scope.openmsg);
          /*>>> >>> >
                140e54362e55bcf40202451ceafe90451e4aebe0

              var populatePage = function () {
                $scope.showTableInbox = function () {
                  console.log("inside showTableInbox");
                  $scope.showTable = true;
                }

                var msg = [];

                function showManualMsg() {
                  $scope.openmsg = [];
                  msg = InboxMsgService.getInboxMessage();
                  if (!msg.length) {
                    $scope.showOpenConversations = false;
                  }
                  console.log("msg show Manual Msg: ", msg);
                  for (var i = 0; i < msg.length; i++) {
                    if (msg[i].assignee.name) {
                      $scope.openmsg.push({
                        id: msg[i]._id,
                        name: msg[i].sName,
                        subject: msg[i].sub,
                        time: $moment(msg[i].ct)
                          .fromNow(),
                        close: 'Close',
                        assign: 'Assigned to ' + msg[i]
                          .assignee
                          .name,
                        coid: msg[i].coId
                      })
                    } else {
                      $scope.openmsg.push({
                        id: msg[i]._id,
                        name: msg[i].sName,
                        subject: msg[i].sub,
                        time: $moment(msg[i].ct)
                          .fromNow(),
                        close: 'Close',
                        assign: 'Assigned to ' + msg[i]
                          .assignee
                          .email,
                        coid: msg[i].coId
                      })
                    }
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

                  $scope.tableParamsInbox = new ngTableParams({
                    page: 1, // show first page
                    count: 10 // count per page
                  }, {
                    total: $scope.openmsg.length, // length of data
                    getData: function ($defer, params) {
                      $defer.resolve($scope.openmsg.slice(
                        (
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
                MsgService.getManualMessage($scope.currApp,
                  showMsgCallback);

                console.log("msg: ", $scope.openmsg);*/


          $scope.showMessageThread = function (index) {
            console.log("index: ", index);
            console.log(InboxMsgService.getInboxMessage());
          }

          $scope.closeConversation = function (coId, user,
            index) {
            MsgService.closeConversationRequest($scope.currApp,
              coId, function (err, user) {
                console.log("coid: ", coId, $scope.openmsg);
                if (err) {
                  console.log("error");
                  return;
                }
                console.log("index: ", index);
                $scope.openmsg.splice(index, 1);
                $scope.tableParamsInbox.reload();
                console.log(
                  "closing open conversation: ",
                  InboxMsgService.getInboxMessage()
                  .length);
                if (InboxMsgService.getInboxMessage()
                  .length == 1) {
                  $scope.showOpenConversations =
                    false;
                }
              });
          }

          $scope.assignTo = function (id) {
            $scope.assignSelect = true;
          }

          $scope.team = AppService.getCurrentApp()
            .team;
          console.log("Appservice getCurrentApp: ",
            AppService.getCurrentApp());
          var assignedTo = function (err, name, index) {
            if (err) {
              return err;
            }
            console.log("$scope.openmsg -->", $scope.openmsg,
              name, index);
            var newIndex = ($scope.pageNo - 1) * $scope.pageCount + index;
            console.log("new index: ", newIndex);
            $scope.openmsg[newIndex].assign = 'Assigned to ' +
              name;
          }

          $scope.assignToMember = function (accId, coId,
            name,
            index) {
            console.log("index: name: ", index, name);
            var data = {
              assignee: accId
            };
            MsgService.assignTo($scope.currApp, coId, data,
              index, name, assignedTo);
          }

          $scope.showSelectedMail = function (id) {
            $location.path('/apps/' + $scope.currApp +
              '/messages/conversations/' + id);


          }

        }

        AppModel.getSingleApp($scope.currApp, populatePage);
      })

  }
])

.controller('UnreadCtrl', ['$scope', '$filter', 'ngTableParams',
  'AppService',
  '$moment', 'MsgService', 'InboxMsgService', '$location',
  '$timeout',
  'CurrentAppService', '$stateParams', 'AppModel',
  function ($scope, $filter, ngTableParams, AppService, $moment,
    MsgService, InboxMsgService, $location, $timeout,
    CurrentAppService, $stateParams, AppModel) {

    CurrentAppService.getCurrentApp()
      .then(function (currentApp) {
        $scope.currApp = $stateParams.id;
        console.log("Promise Resolved: ", currentApp);
        $scope.showUnreadMsgs = true;

        console.log("inside UnreadCtrl");


        var populatePage = function () {

          $scope.goToOpenMsg = function () {
            $location.path('/apps/' + $stateParams.id + '/messages/open');
          }

          $scope.goToUnreadMsg = function () {
            $location.path('/apps/' + $stateParams.id + '/messages/unread');
          }

          $scope.goToClosedMsg = function () {
            $location.path('/apps/' + $stateParams.id + '/messages/closed');
          }

          $scope.goToGoodHealth = function () {
            $location.path('/apps/' + $stateParams.id +
              '/messages/goodhealth');
          }

          $scope.goToAvgHealth = function () {
            $location.path('/apps/' + $stateParams.id +
              '/messages/avghealth');
          }

          $scope.goToPoorHealth = function () {
            $location.path('/apps/' + $stateParams.id +
              '/messages/poorhealth');
          }
          $scope.unreadmsg = [];
          var msg = [];
          var populateUnreadMsg = function () {
            msg = InboxMsgService.getUnreadMessage();
            console.log("unread msgs ---> ", msg);
            if (!msg.length) {
              $scope.showUnreadMsgs = false;
            }

            for (var i = 0; i < msg.length; i++) {
              // $scope.unreadmsg.push({
              //   id: msg[i]._id,
              //   name: msg[i].uid.email,
              //   subject: msg[i].sub,
              //   time: $moment(msg[i].ct)
              //     .fromNow(),
              //   close: 'Close',
              //   assign: 'Assigned to ' + msg[i]
              //     .assignee
              //     .name,
              //   coid: msg[i].coId
              // })
              // 
              var m = {
                id: msg[i]._id,
                name: msg[i].uid.email,
                subject: msg[i].sub,
                time: $moment(msg[i].ct)
                  .fromNow(),
                close: msg[i].closed,
                coid: msg[i].coId
              };

              var assignee = msg[i].assignee || {};
              if (msg[i].closed) {
                m.buttonText = 'Reopen';
              } else {
                m.buttonText = 'Close';
              }


              if (assignee.name) {
                m.assign = 'Assigned to ' + assignee.name;
              } else if (assignee.email) {
                m.assign = 'Assigned to ' + assignee.email;
              } else {
                m.assign = 'Assign';
              }

              $scope.unreadmsg.push(m);
            };

            console.log("$scope.unreadmsg --->", $scope.unreadmsg);
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
                total: $scope.unreadmsg.length, // length of data
                getData: function ($defer, params) {
                  $scope.pageNo = params.page();
                  $scope.pageCount = params.count();
                  console.log("page No page Count: ", $scope.pageNo,
                    $scope.pageCount);
                  $defer.resolve($scope.unreadmsg.slice(
                    (
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



          MsgService.getUnreadMessages($scope.currApp,
            showUnreadMsgCallBack);

          $scope.closeReopenConversation = function (coId, user,
            index) {
            if (!user.close) {
              MsgService.closeConversationRequest($scope.currApp,
                coId, function (err, user) {
                  console.log("coid: ", coId, $scope.unreadmsg);
                  if (err) {
                    console.log("error");
                    return;
                  }
                  console.log("index: ", index);
                  // $scope.unreadmsg.splice(index, 1);
                  $scope.unreadmsg[index].buttonText = 'Reopen';
                  $scope.unreadmsg[index].close = true;
                  $scope.tableParamsSent.reload();

                  console.log(
                    "closing open conversation: ",
                    InboxMsgService.getInboxMessage()
                    .length);
                  if ($scope.unreadmsg
                    .length == 0) {
                    $scope.showUnreadMsgs =
                      false;
                  }
                });
            } else {
              MsgService.reopenConversation($scope.currApp, coId,
                function (err, user) {
                  if (err) {
                    console.log("error");
                    return;
                  }
                  console.log("changing buttontext to close");
                  $scope.unreadmsg[index].buttonText = 'Close';
                  $scope.unreadmsg[index].close = false;
                });
            }
          }

          // $scope.reopenConversation = function (coId, user,
          //   index) {
          //   MsgService.reopenConversation($scope.currApp, coId,
          //     function (err, user) {
          //       if (err) {
          //         console.log("error");
          //         return;
          //       }
          //       console.log("changing buttontext to close");
          //       $scope.unreadmsg[index].buttonText = 'Close';
          //     });
          // }

          $scope.assignTo = function (id) {
            $scope.assignSelect = true;
          }

          $scope.team = AppService.getCurrentApp()
            .team;
          console.log("$scope.team: ", $scope.team);
          var assignedTo = function (err, name, index) {
            if (err) {
              return err;
            }
            console.log("$scope.openmsg -->", $scope.openmsg,
              name, index);
            var newIndex = ($scope.pageNo - 1) * $scope.pageCount + index;
            console.log("new index: ", newIndex);
            $scope.unreadmsg[newIndex].assign = 'Assigned to ' +
              name;
          }

          $scope.assignToMember = function (accId, coId,
            name,
            index) {
            console.log("index: name: ", index, name);
            var data = {
              assignee: accId
            };
            MsgService.assignTo($scope.currApp, coId, data,
              index, name, assignedTo);
          }

          $scope.showSelectedMail = function (id) {
            $location.path('/apps/' + $scope.currApp +
              '/messages/conversations/' + id);
          }
        }


        AppModel.getSingleApp($scope.currApp, populatePage);


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
  '$log', '$stateParams', 'CurrentAppService', 'AppModel', 'UserModel',
  '$location',
  function ($scope, MsgService, AppService, ThreadService, $moment,
    InboxMsgService, AccountService, $log, $stateParams, CurrentAppService,
    AppModel, UserModel, $location) {


    CurrentAppService.getCurrentApp()
      .then(function (currentApp) {



        console.log(AccountService.get());


        $scope.coId = $stateParams.messageId;
        $scope.appId = $stateParams.id;

        $scope.doTheBack = function () {
          if (history.length == 1) {
            $location.path('/apps/' + $scope.appId + '/messages/open');
          } else {
            window.history.back();
          }
        }

        var populatePage = function () {
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

          // var gravatar = '';
          // var src = '';



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
            if (msgThread.messages[0].from == 'account') {
              $scope.fromTo = 'to';
            }
            if (msgThread.messages[0].from == 'user') {
              $scope.fromTo = 'from';
            }


            var userEmail = msgThread.uid.email;

            $scope.individualCustomer = userEmail;
            $scope.subject = msgThread.sub;
            if (msgThread.amId) {
              $scope.isAutoMessage = true;
            } else {
              $scope.isAutoMessage = false;
            }

            for (var i = 0; i < msgThread.messages.length; i++) {
              var m = msgThread.messages[i];
              var isSeen = false;
              var mBody = m.body.replace(/\\r\\n/g, '<br/>');
              var mObj = {
                messagebody: mBody,
                createdat: $moment(m.ct)
                  .fromNow(),
                seen: isSeen,
              };

              if (m.from === 'user') {
                mObj.email = userEmail;
                mObj.admin = false;
              }
              if (m.from === 'account') {
                console.log("accoid.email: ", m.accid.email);
                mObj.email = m.accid.email;
                mObj.admin = true;
              }

              if (m.sName) {
                mObj.createdby = m.sName;
              } else {
                mObj.createdby = mObj.email;
              }

              mObj.seen = (m.from === 'account') && m.seen;


              $scope.messages.push(mObj);
            };
            console.log("$scope.messages: ", $scope.messages);
          }



          $scope.loadAvatar = function () {
            console.log("img not found");
          }

          function get_gravatar(email, size) {

            // MD5 (Message-Digest Algorithm) by WebToolkit
            // 

            var MD5 = function (s) {
              function L(k, d) {
                return (k << d) | (k >>> (32 - d))
              }

              function K(G, k) {
                var I, d, F, H, x;
                F = (G & 2147483648);
                H = (k & 2147483648);
                I = (G & 1073741824);
                d = (k & 1073741824);
                x = (G & 1073741823) + (k & 1073741823);
                if (I & d) {
                  return (x ^ 2147483648 ^ F ^ H)
                }
                if (I | d) {
                  if (x & 1073741824) {
                    return (x ^ 3221225472 ^ F ^ H)
                  } else {
                    return (x ^ 1073741824 ^ F ^ H)
                  }
                } else {
                  return (x ^ F ^ H)
                }
              }

              function r(d, F, k) {
                return (d & F) | ((~d) & k)
              }

              function q(d, F, k) {
                return (d & k) | (F & (~k))
              }

              function p(d, F, k) {
                return (d ^ F ^ k)
              }

              function n(d, F, k) {
                return (F ^ (d | (~k)))
              }

              function u(G, F, aa, Z, k, H, I) {
                G = K(G, K(K(r(F, aa, Z), k), I));
                return K(L(G, H), F)
              }

              function f(G, F, aa, Z, k, H, I) {
                G = K(G, K(K(q(F, aa, Z), k), I));
                return K(L(G, H), F)
              }

              function D(G, F, aa, Z, k, H, I) {
                G = K(G, K(K(p(F, aa, Z), k), I));
                return K(L(G, H), F)
              }

              function t(G, F, aa, Z, k, H, I) {
                G = K(G, K(K(n(F, aa, Z), k), I));
                return K(L(G, H), F)
              }

              function e(G) {
                var Z;
                var F = G.length;
                var x = F + 8;
                var k = (x - (x % 64)) / 64;
                var I = (k + 1) * 16;
                var aa = Array(I - 1);
                var d = 0;
                var H = 0;
                while (H < F) {
                  Z = (H - (H % 4)) / 4;
                  d = (H % 4) * 8;
                  aa[Z] = (aa[Z] | (G.charCodeAt(H) << d));
                  H++
                }
                Z = (H - (H % 4)) / 4;
                d = (H % 4) * 8;
                aa[Z] = aa[Z] | (128 << d);
                aa[I - 2] = F << 3;
                aa[I - 1] = F >>> 29;
                return aa
              }

              function B(x) {
                var k = "",
                  F = "",
                  G, d;
                for (d = 0; d <= 3; d++) {
                  G = (x >>> (d * 8)) & 255;
                  F = "0" + G.toString(16);
                  k = k + F.substr(F.length - 2, 2)
                }
                return k
              }

              function J(k) {
                k = k.replace(/rn/g, "n");
                var d = "";
                for (var F = 0; F < k.length; F++) {
                  var x = k.charCodeAt(F);
                  if (x < 128) {
                    d += String.fromCharCode(x)
                  } else {
                    if ((x > 127) && (x < 2048)) {
                      d += String.fromCharCode((x >> 6) | 192);
                      d += String.fromCharCode((x & 63) | 128)
                    } else {
                      d += String.fromCharCode((x >> 12) | 224);
                      d += String.fromCharCode(((x >> 6) & 63) | 128);
                      d += String.fromCharCode((x & 63) | 128)
                    }
                  }
                }
                return d
              }
              var C = Array();
              var P, h, E, v, g, Y, X, W, V;
              var S = 7,
                Q = 12,
                N = 17,
                M = 22;
              var A = 5,
                z = 9,
                y = 14,
                w = 20;
              var o = 4,
                m = 11,
                l = 16,
                j = 23;
              var U = 6,
                T = 10,
                R = 15,
                O = 21;
              s = J(s);
              C = e(s);
              Y = 1732584193;
              X = 4023233417;
              W = 2562383102;
              V = 271733878;
              for (P = 0; P < C.length; P += 16) {
                h = Y;
                E = X;
                v = W;
                g = V;
                Y = u(Y, X, W, V, C[P + 0], S, 3614090360);
                V = u(V, Y, X, W, C[P + 1], Q, 3905402710);
                W = u(W, V, Y, X, C[P + 2], N, 606105819);
                X = u(X, W, V, Y, C[P + 3], M, 3250441966);
                Y = u(Y, X, W, V, C[P + 4], S, 4118548399);
                V = u(V, Y, X, W, C[P + 5], Q, 1200080426);
                W = u(W, V, Y, X, C[P + 6], N, 2821735955);
                X = u(X, W, V, Y, C[P + 7], M, 4249261313);
                Y = u(Y, X, W, V, C[P + 8], S, 1770035416);
                V = u(V, Y, X, W, C[P + 9], Q, 2336552879);
                W = u(W, V, Y, X, C[P + 10], N, 4294925233);
                X = u(X, W, V, Y, C[P + 11], M, 2304563134);
                Y = u(Y, X, W, V, C[P + 12], S, 1804603682);
                V = u(V, Y, X, W, C[P + 13], Q, 4254626195);
                W = u(W, V, Y, X, C[P + 14], N, 2792965006);
                X = u(X, W, V, Y, C[P + 15], M, 1236535329);
                Y = f(Y, X, W, V, C[P + 1], A, 4129170786);
                V = f(V, Y, X, W, C[P + 6], z, 3225465664);
                W = f(W, V, Y, X, C[P + 11], y, 643717713);
                X = f(X, W, V, Y, C[P + 0], w, 3921069994);
                Y = f(Y, X, W, V, C[P + 5], A, 3593408605);
                V = f(V, Y, X, W, C[P + 10], z, 38016083);
                W = f(W, V, Y, X, C[P + 15], y, 3634488961);
                X = f(X, W, V, Y, C[P + 4], w, 3889429448);
                Y = f(Y, X, W, V, C[P + 9], A, 568446438);
                V = f(V, Y, X, W, C[P + 14], z, 3275163606);
                W = f(W, V, Y, X, C[P + 3], y, 4107603335);
                X = f(X, W, V, Y, C[P + 8], w, 1163531501);
                Y = f(Y, X, W, V, C[P + 13], A, 2850285829);
                V = f(V, Y, X, W, C[P + 2], z, 4243563512);
                W = f(W, V, Y, X, C[P + 7], y, 1735328473);
                X = f(X, W, V, Y, C[P + 12], w, 2368359562);
                Y = D(Y, X, W, V, C[P + 5], o, 4294588738);
                V = D(V, Y, X, W, C[P + 8], m, 2272392833);
                W = D(W, V, Y, X, C[P + 11], l, 1839030562);
                X = D(X, W, V, Y, C[P + 14], j, 4259657740);
                Y = D(Y, X, W, V, C[P + 1], o, 2763975236);
                V = D(V, Y, X, W, C[P + 4], m, 1272893353);
                W = D(W, V, Y, X, C[P + 7], l, 4139469664);
                X = D(X, W, V, Y, C[P + 10], j, 3200236656);
                Y = D(Y, X, W, V, C[P + 13], o, 681279174);
                V = D(V, Y, X, W, C[P + 0], m, 3936430074);
                W = D(W, V, Y, X, C[P + 3], l, 3572445317);
                X = D(X, W, V, Y, C[P + 6], j, 76029189);
                Y = D(Y, X, W, V, C[P + 9], o, 3654602809);
                V = D(V, Y, X, W, C[P + 12], m, 3873151461);
                W = D(W, V, Y, X, C[P + 15], l, 530742520);
                X = D(X, W, V, Y, C[P + 2], j, 3299628645);
                Y = t(Y, X, W, V, C[P + 0], U, 4096336452);
                V = t(V, Y, X, W, C[P + 7], T, 1126891415);
                W = t(W, V, Y, X, C[P + 14], R, 2878612391);
                X = t(X, W, V, Y, C[P + 5], O, 4237533241);
                Y = t(Y, X, W, V, C[P + 12], U, 1700485571);
                V = t(V, Y, X, W, C[P + 3], T, 2399980690);
                W = t(W, V, Y, X, C[P + 10], R, 4293915773);
                X = t(X, W, V, Y, C[P + 1], O, 2240044497);
                Y = t(Y, X, W, V, C[P + 8], U, 1873313359);
                V = t(V, Y, X, W, C[P + 15], T, 4264355552);
                W = t(W, V, Y, X, C[P + 6], R, 2734768916);
                X = t(X, W, V, Y, C[P + 13], O, 1309151649);
                Y = t(Y, X, W, V, C[P + 4], U, 4149444226);
                V = t(V, Y, X, W, C[P + 11], T, 3174756917);
                W = t(W, V, Y, X, C[P + 2], R, 718787259);
                X = t(X, W, V, Y, C[P + 9], O, 3951481745);
                Y = K(Y, h);
                X = K(X, E);
                W = K(W, v);
                V = K(V, g)
              }
              var i = B(Y) + B(X) + B(W) + B(V);
              return i.toLowerCase()
            };

            var size = size || 80;
            console.log("gravatar image: ",
              'https://www.gravatar.com/avatar/' + MD5(email) +
              '.jpg?d=404');
            return 'https://www.gravatar.com/avatar/' + MD5(email) +
              '.jpg?d=404';
          }

          function setAvatarColors() {

            for (var i = 0; i < $scope.messages.length; i++) {
              console.log("value of i :");
              var imgsrc = '';
              var imggravatar = '';
              var count = 0;
              var storedimgsrc = '';
              console.log("message object: ", $scope.messages[i]);
              var name = $scope.messages[i].createdby;
              if (name) {
                var initials = name.charAt(0);
              } else {
                var initials = $scope.messages[i].email.charAt(0);
              }
              var color = getRandomColor();
              for (var j = 0; j < i; j++) {
                console.log("i: ", i);
                // TODO : Get data from backend and match it based on uid
                if ($scope.messages[j].email == $scope.messages[
                    i]
                  .email) {
                  count++;
                  storedimgsrc = $scope.messagesWithSrc[j].src;
                  break;
                }
              }

              imggravatar = get_gravatar($scope.messages[i].email, 60);


              console.log("storedimgsrc: ", storedimgsrc);
              /*if(count == 1) {
                imgsrc = $scope.messagesWithSrc[i].src;
            }*/

              if (count < 1) {
                imgsrc = 'http://placehold.it/60/' + color +
                  '/FFF&text=' +
                  initials;
                console.log("imgsrc gravatar: ", imgsrc);
                console.log("imgsrc gravatar: ", imgsrc);
                $scope.messagesWithSrc.push({
                  messagebody: $scope.messages[i].messagebody,
                  createdby: $scope.messages[i].createdby,
                  createdat: $scope.messages[i].createdat,
                  src: imgsrc,
                  gravatar: imggravatar,
                  seen: $scope.messages[i].seen,
                  email: $scope.messages[i].email,
                  admin: $scope.messages[i].admin,
                })
              } else {
                $scope.messagesWithSrc.push({
                  messagebody: $scope.messages[i].messagebody,
                  createdby: $scope.messages[i].createdby,
                  createdat: $scope.messages[i].createdat,
                  src: storedimgsrc,
                  gravatar: imggravatar,
                  seen: $scope.messages[i].seen,
                  email: $scope.messages[i].email,
                  admin: $scope.messages[i].admin
                })
              }


              console.log("src generated: ", $scope.messagesWithSrc[
                i].src);
              console.log("with src: ", $scope.messagesWithSrc);
            };
            $scope.replysrc = '';
            console.log("USer loggedin: ", AccountService.get());
            $scope.user = AccountService.get()
              .name;
            $scope.loggedInEmail = AccountService.get()
              .email;

            for (var i = 0; i < $scope.messagesWithSrc.length; i++) {
              if ($scope.loggedInEmail == $scope.messagesWithSrc[i].email) {
                $scope.replysrc = $scope.messagesWithSrc[i].src;
                $scope.replygravatar = $scope.messagesWithSrc[i].gravatar;
                break;
              } else {
                var colorReply = getRandomColor();
                console.log("$scope.user: ", $scope.user);
                $scope.replysrc = 'http://placehold.it/60/' +
                  colorReply +
                  '/FFF&text=' + $scope.user.charAt(0);
                $scope.replygravatar = get_gravatar($scope.loggedInEmail,
                  60);
              }
            };
          }

          $scope.goToUserProfile = function () {
            $location.path('/apps/' + $scope.appId + '/users/profile/' +
              ThreadService.getThread()
              .uid._id);
          }

          var populateUserProfile = function (err, data, id) {
            if (err) {
              return err;
            }
            console.log("data: ", data);
            $scope.customerEmail = data.email;
            var keys = _.keys(data);
            $scope.userdata = [];

            function capitaliseFirstLetter(string) {
              return string.charAt(0)
                .toUpperCase() + string.slice(1);
            }
            for (var i = 0; i < keys.length; i++) {
              prop = keys[i];
              console.log("id: ", prop);
              value = data[prop];
              $scope.companies = [];
              if (prop == 'companies') {
                // $scope.companies = value;
                value.forEach(function (company) {
                  $scope.companies.push({
                    name: company.name
                  });
                })
                if ($scope.companies.length == 1) {
                  $scope.showCompany = true;
                }

                if ($scope.companies.length > 1) {
                  $scope.showCompanies = true;
                }
              }
              // console.log("value prop: ", value, prop);
              if (prop != 'companies' && prop != 'ct' && prop != 'meta' &&
                prop != 'ut' && prop != '__v' && prop != 'aid' && prop !=
                '_id') {
                if (prop == 'lastSeen') {
                  prop = 'Last Seen';
                  value = $moment(value)
                    .fromNow()
                }

                if (prop == 'lastSession') {
                  prop = 'Last Session';
                  value = $moment(value)
                    .fromNow()
                }

                if (prop == 'joined') {
                  value = $moment(value)
                    .fromNow()
                }
                prop = capitaliseFirstLetter(prop);
                $scope.userdata.push({
                  value: value,
                  data: prop
                })
              }
            };

            console.log("userdata: ", $scope.userdata);
            $scope.customergravatar = get_gravatar(data.email, 80);
            $scope.customersrc = 'http://placehold.it/60/' +
              getRandomColor() +
              '/FFF&text=' +
              data.email.charAt(0);
            // TODO: You have to get more data from backend
          }

            function getUserProfile() {
              UserModel.getUserProfile(ThreadService.getThread()
                .uid._id, $scope.appId, populateUserProfile);
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
          // var appId = $stateParams.id;
          console.log($scope.appId);
          // var coId = $stateParams.messageId;

          var msgServiceCallback = function (err) {
            if (err) return $log.error(err);
            setMessagesIntoScope();
            setAvatarColors();
            getUserProfile();
            // get_gravatar('savinay.90@gmail.com', 60);
            console.log("$scope.messages: ", $scope.messages);
          };

          MsgService.getMessageThread($scope.appId, $scope.coId,
            msgServiceCallback);




          // TODO : Get data from backend and match it based on uid

          $scope.customer = 'John';
          $scope.custsrc = '';

          // for (var i = 0; i < $scope.messagesWithSrc.length; i++) {
          //   if ($scope.customer == $scope.messagesWithSrc[i].createdby) {
          //     $scope.custsrc = $scope.messagesWithSrc[i].src;
          //     break;
          //   } else {
          //     var colorReply = getRandomColor();
          //     $scope.custsrc = 'http://placehold.it/60/' +
          //       colorReply +
          //       '/FFF&text=' + $scope.user.charAt(0);
          //   }
          // };


          $scope.replies = [];

          $scope.replyButtonClicked = false;

          var closeButtonClicked = false;

          var lengthReply = $scope.replytext.length;

          $scope.disableReply = false;

          $scope.disableClose = false;

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
            $scope.disableReply = false;
            if (err) {
              console.log("error");
              return;
            }
            if (ThreadService.getReply) {
              $scope.replytextInDiv = $scope.replytext.replace(/\\r\\n/g,
                '<br/>');
              $scope.replytext = '';
              $scope.replies.push({
                body: $scope.replytextInDiv
              })
            }


          }

          var closeOrReopenReplyCallBack = function (err) {
            $scope.disableClose = false;
            if (err) {
              console.log("error");
              return;
            }
            if (ThreadService.getReply) {
              $scope.replytextInDiv = $scope.replytext.replace(/\\r\\n/g,
                '<br/>');
              $scope.replytext = '';
              console.log("pushing msg: ", $scope.replytextInDiv);
              $scope.replies.push({
                body: $scope.replytextInDiv
              })
              console.log('object of replies: ', $scope.replies);
              $scope.insideReplyBox = false;
              console.log('validateReply', $scope.replytext);

              if (!ThreadService.getThread()
                .closed) {
                MsgService.closeConversationRequest($scope.appId, $scope
                  .coId, function (err, user) {
                    if (err) {
                      console.log("error");
                      return;
                    }
                    console.log(
                      "changing button text to reopen");
                    $scope.buttontext = 'Reopen';
                  });
              } else {
                MsgService.reopenConversation($scope.appId, $scope.coId,
                  function (err, user) {
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
            $scope.disableReply = true;
            coId = pathArray[4];
            console.log('reply text length is:', $scope.replytext.length);
            if (!$scope.replytext.length) {
              console.log('error in reply');
              $scope.disableReply = false;
              $scope.showerror = true;
              return;
            }
            if ($scope.replytext.length > 0) {
              console.log("reply button clicked and validated");
              $scope.replyButtonClicked = true;
              var sanitizedReply = $scope.replytext.replace(/\n/g,
                '<br/>')
                .replace(/\r/g, '');
              console.log("sanitized reply: ", sanitizedReply);
              MsgService.replyToMsg($scope.appId, $scope.coId,
                sanitizedReply,
                AccountService.get()
                ._id, replyCallBack);

            }
          }

          $scope.closeTicket = function () {
            closeButtonClicked = true;
            $scope.disableClose = true;

            if (!ThreadService.getThread()
              .closed) {

              if ($scope.replytext.length > 0) {
                $scope.replyButtonClicked = true;
                $scope.replytextInDiv = $scope.replytext.replace(/\n/g,
                  '<br/>')
                  .replace(/\r/g, '');
                MsgService.replyToMsg($scope.appId, $scope.coId, $scope.replytextInDiv,
                  AccountService.get()
                  ._id, closeOrReopenReplyCallBack);
              } else {
                MsgService.closeConversationRequest($scope.appId, $scope
                  .coId, function (err, user) {
                    $scope.disableClose = false;
                    if (err) {
                      console.log("error");
                      return;
                    }
                    console.log(
                      "changing button text to reopen");
                    $scope.buttontext = 'Reopen';
                  });
              }

            } else {
              if ($scope.replytext.length > 0) {
                $scope.replyButtonClicked = true;
                $scope.replytextInDiv = $scope.replytextreplace(/\n/g,
                  '<br/>')
                  .replace(/\r/g, '');;
                MsgService.replyToMsg($scope.appId, $scope.coId, $scope.replytextInDiv,
                  AccountService.get()
                  ._id, closeOrReopenReplyCallBack);
              } else {
                MsgService.reopenConversation($scope.appId, $scope.coId,
                  function (err, user) {
                    $scope.disableClose = false;
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


        AppModel.getSingleApp($scope.appId, populatePage);

      })



    // 

  }
])

.controller('closedConversationCtrl', ['$scope', 'MsgService',
  'AppService',
  'InboxMsgService', '$moment', '$filter', 'ngTableParams',
  '$log',
  '$location', '$timeout', 'CurrentAppService', '$stateParams', 'AppModel',
  function ($scope, MsgService, AppService, InboxMsgService,
    $moment,
    $filter, ngTableParams, $log, $location, $timeout,
    CurrentAppService, $stateParams, AppModel) {

    CurrentAppService.getCurrentApp()
      .then(function (currentApp) {
        console.log("Promise Resolved: ", currentApp);
        $scope.currApp = $stateParams.id;
        console.log("inside closedConversationCtrl");
        $scope.showClosedConversations = true;
        var msg = [];

        var populatePage = function () {

          $scope.goToOpenMsg = function () {
            $location.path('/apps/' + $stateParams.id + '/messages/open');
          }

          $scope.goToUnreadMsg = function () {
            $location.path('/apps/' + $stateParams.id + '/messages/unread');
          }

          $scope.goToClosedMsg = function () {
            $location.path('/apps/' + $stateParams.id + '/messages/closed');
          }

          $scope.goToGoodHealth = function () {
            $location.path('/apps/' + $stateParams.id +
              '/messages/goodhealth');
          }

          $scope.goToAvgHealth = function () {
            $location.path('/apps/' + $stateParams.id +
              '/messages/avghealth');
          }

          $scope.goToPoorHealth = function () {
            $location.path('/apps/' + $stateParams.id +
              '/messages/poorhealth');
          }

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
                name: msg[i].uid.email,
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
                  $defer.resolve(orderedData.slice(
                    (
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

          MsgService.getClosedConversations($scope.currApp,
            showClosedMsgCallback);

          $scope.showClosedConversations = function (id) {
            $location.path('/apps/' + $scope.currApp +
              '/messages/conversations/' + id);


          }
        }

        AppModel.getSingleApp($scope.currApp, populatePage);


      })
  }
])

.controller('goodHealthConversationCtrl', ['$scope', 'MsgService',
  'AppService',
  'InboxMsgService', '$moment', '$filter', 'ngTableParams',
  '$log',
  '$location', '$timeout', 'CurrentAppService', '$stateParams', 'AppModel',
  function ($scope, MsgService, AppService, InboxMsgService,
    $moment,
    $filter, ngTableParams, $log, $location, $timeout,
    CurrentAppService, $stateParams, AppModel) {

    CurrentAppService.getCurrentApp()
      .then(function (currentApp) {
        console.log("Promise Resolved: ", currentApp);
        $scope.currApp = $stateParams.id;
        console.log("inside closedConversationCtrl");
        $scope.showGoodHealthConversations = true;
        var msg = [];

        // var populatePage = function () {
        //   function showGoodHealthMsg(msg) {
        //     $scope.goodhealthmsg = [];
        //     // msg = InboxMsgService.getClosedMessage();
        //     if (!msg.length) {
        //       $scope.showGoodHealthConversations = false;
        //     }
        //     console.log("msg show good health Msg -> -> ", msg);
        //     for (var i = 0; i < msg.length; i++) {
        //       $scope.goodhealthmsg.push({
        //         id: msg[i]._id,
        //         name: msg[i].uid.email,
        //         subject: msg[i].sub,
        //         time: $moment(msg[i].ct)
        //           .fromNow()
        //       })
        //     }
        //     console.log("$scope.data: ", $scope.goodhealthmsg);
        //     $scope.columnsClosed = [{
        //       title: 'User',
        //       field: 'name',
        //       visible: true,
        //       filter: {
        //         'name': 'text'
        //       }
        //     }, {
        //       title: 'Subject',
        //       field: 'subject',
        //       visible: true
        //     }, {
        //       title: 'When',
        //       field: 'time',
        //       visible: true
        //     }];

        //     $scope.refreshTable = function () {
        //       $scope['tableParams'] = {
        //         reload: function () {},
        //         settings: function () {
        //           return {}
        //         }
        //       };
        //       $timeout(setTable, 100)
        //     };
        //     $scope.refreshTable();

        //     function setTable(arguments) {

        //       $scope.tableParamsClosed = new ngTableParams({
        //         page: 1, // show first page
        //         count: 10, // count per page
        //         filter: {
        //           name: '' // initial filter
        //         },
        //         sorting: {
        //           name: 'asc'
        //         }
        //       }, {
        //         filterSwitch: true,
        //         total: $scope.goodhealthmsg.length, // length of data
        //         getData: function ($defer, params) {
        //           var orderedData = params.sorting() ?
        //             $filter('orderBy')($scope.goodhealthmsg,
        //               params.orderBy()) :
        //             $scope.goodhealthmsg;
        //           params.total(orderedData.length);
        //           $defer.resolve(orderedData.slice(
        //             (
        //               params.page() -
        //               1) * params.count(),
        //             params.page() *
        //             params.count()));
        //         }
        //       });
        //     }
        //   }

        //   var showGoodHealthMsgCallback = function (err, data) {
        //     if (err) {
        //       return;
        //     }
        //     showGoodHealthMsg(data);
        //   }

        //   MsgService.getGoodHealthConversations($scope.currApp,
        //     showGoodHealthMsgCallback);

        //   $scope.showGoodHealthThread = function (id) {
        //     $location.path('/apps/' + $scope.currApp +
        //       '/messages/conversations/' + id);


        //   }
        // }

        var populatePage = function () {

          $scope.goToOpenMsg = function () {
            $location.path('/apps/' + $stateParams.id + '/messages/open');
          }

          $scope.goToUnreadMsg = function () {
            $location.path('/apps/' + $stateParams.id + '/messages/unread');
          }

          $scope.goToClosedMsg = function () {
            $location.path('/apps/' + $stateParams.id + '/messages/closed');
          }

          $scope.goToGoodHealth = function () {
            $location.path('/apps/' + $stateParams.id +
              '/messages/goodhealth');
          }

          $scope.goToAvgHealth = function () {
            $location.path('/apps/' + $stateParams.id +
              '/messages/avghealth');
          }

          $scope.goToPoorHealth = function () {
            $location.path('/apps/' + $stateParams.id +
              '/messages/poorhealth');
          }

          function showGoodHealthMsg(msg) {
            if (msg.length == 0) {
              $scope.showGoodHealthConversations = false;
            }
            $scope.goodhealthmsg = [];
            $scope.goodHealthMessageView = msg;
            if (!msg.length) {
              $scope.showAvgHealthConversations = false;
            }
            console.log("msg show good health Msg -> -> ", msg);

            for (var i = 0; i < msg.length; i++) {
              var m = {
                id: msg[i]._id,
                name: msg[i].uid.email,
                subject: msg[i].sub,
                time: $moment(msg[i].ct)
                  .fromNow(),
                close: 'Close',
                coid: msg[i].coId
              };

              var assignee = msg[i].assignee || {};

              if (assignee.name) {
                m.assign = 'Assigned to ' + assignee.name;
              } else if (assignee.email) {
                m.assign = 'Assigned to ' + assignee.email;
              } else {
                m.assign = 'Assign';
              }

              $scope.goodhealthmsg.push(m);

            };

            console.log("$scope.data: ", $scope.goodhealthmsg);
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
            }, {
              title: '',
              field: 'close',
              visible: 'true'
            }, {
              title: '',
              field: 'assign',
              visible: 'true'
            }];

            $scope.tableParamsClosed = new ngTableParams({
              page: 1, // show first page
              count: 10 // count per page
            }, {
              total: $scope.goodhealthmsg.length, // length of data
              getData: function ($defer, params) {
                $scope.pageNo = params.page();
                $scope.pageCount = params.count();
                console.log("page No page Count: ", $scope.pageNo,
                  $scope.pageCount);
                $defer.resolve($scope.goodhealthmsg.slice(
                  (
                    params.page() -
                    1) * params.count(),
                  params.page() *
                  params.count()));
              }
            });
          }

          var showGoodHealthMsgCallback = function (err, data) {
            if (err) {
              return;
            }
            showGoodHealthMsg(data);
          }

          MsgService.getGoodHealthConversations($scope.currApp,
            showGoodHealthMsgCallback);

          $scope.showGoodHealthThread = function (id) {
            $location.path('/apps/' + $scope.currApp +
              '/messages/conversations/' + id);


          }

          $scope.closeConversation = function (coId, user,
            index) {
            MsgService.closeConversationRequest($scope.currApp,
              coId, function (err, user) {
                console.log("coid: ", coId, $scope.goodhealthmsg);
                if (err) {
                  console.log("error");
                  return;
                }
                console.log("index: ", index);
                $scope.goodhealthmsg.splice(index, 1);
                $scope.tableParamsClosed.reload();
                console.log(
                  "closing open conversation: ",
                  $scope.goodHealthMessageView
                  .length);
                if ($scope.goodhealthmsg
                  .length == 0) {
                  $scope.showGoodHealthConversations =
                    false;
                }
              });
          }

          $scope.assignTo = function (id) {
            $scope.assignSelect = true;
          }

          $scope.team = AppService.getCurrentApp()
            .team;
          console.log("Appservice getCurrentApp: ",
            AppService.getCurrentApp());
          var assignedTo = function (err, name, index) {
            if (err) {
              return err;
            }
            console.log("$scope.goodhealthmsg -->", $scope.goodhealthmsg,
              name, index);
            var newIndex = ($scope.pageNo - 1) * $scope.pageCount + index;
            console.log("new index: ", newIndex);
            $scope.goodhealthmsg[newIndex].assign = 'Assigned to ' +
              name;
          }

          $scope.assignToMember = function (accId, coId,
            name,
            index) {
            console.log("index: name: ", index, name);
            var data = {
              assignee: accId
            };
            MsgService.assignTo($scope.currApp, coId, data,
              index, name, assignedTo);
          }
        }


        AppModel.getSingleApp($scope.currApp, populatePage);


      })
  }
])

.controller('avgHealthConversationCtrl', ['$scope', 'MsgService',
  'AppService',
  'InboxMsgService', '$moment', '$filter', 'ngTableParams',
  '$log',
  '$location', '$timeout', 'CurrentAppService', '$stateParams', 'AppModel',
  function ($scope, MsgService, AppService, InboxMsgService,
    $moment,
    $filter, ngTableParams, $log, $location, $timeout,
    CurrentAppService, $stateParams, AppModel) {

    CurrentAppService.getCurrentApp()
      .then(function (currentApp) {
        console.log("Promise Resolved: ", currentApp);
        $scope.currApp = $stateParams.id;
        console.log("inside closedConversationCtrl");
        $scope.showAvgHealthConversations = true;
        var msg = [];

        var populatePage = function () {

          $scope.goToOpenMsg = function () {
            $location.path('/apps/' + $stateParams.id + '/messages/open');
          }

          $scope.goToUnreadMsg = function () {
            $location.path('/apps/' + $stateParams.id + '/messages/unread');
          }

          $scope.goToClosedMsg = function () {
            $location.path('/apps/' + $stateParams.id + '/messages/closed');
          }

          $scope.goToGoodHealth = function () {
            $location.path('/apps/' + $stateParams.id +
              '/messages/goodhealth');
          }

          $scope.goToAvgHealth = function () {
            $location.path('/apps/' + $stateParams.id +
              '/messages/avghealth');
          }

          $scope.goToPoorHealth = function () {
            $location.path('/apps/' + $stateParams.id +
              '/messages/poorhealth');
          }

          function showAvgHealthMsg(msg) {
            $scope.avghealthmsg = [];
            $scope.averageHealthMsg = msg
            if (!msg.length) {
              $scope.showAvgHealthConversations = false;
            }
            console.log("msg show good health Msg -> -> ", msg);

            for (var i = 0; i < msg.length; i++) {
              var m = {
                id: msg[i]._id,
                name: msg[i].uid.email,
                subject: msg[i].sub,
                time: $moment(msg[i].ct)
                  .fromNow(),
                close: 'Close',
                coid: msg[i].coId
              };

              var assignee = msg[i].assignee || {};

              if (assignee.name) {
                m.assign = 'Assigned to ' + assignee.name;
              } else if (assignee.email) {
                m.assign = 'Assigned to ' + assignee.email;
              } else {
                m.assign = 'Assign';
              }

              $scope.avghealthmsg.push(m);

            };

            console.log("$scope.data: ", $scope.avghealthmsg);
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
            }, {
              title: '',
              field: 'close',
              visible: 'true'
            }, {
              title: '',
              field: 'assign',
              visible: 'true'
            }];

            $scope.tableParamsClosed = new ngTableParams({
              page: 1, // show first page
              count: 10 // count per page
            }, {
              total: $scope.avghealthmsg.length, // length of data
              getData: function ($defer, params) {
                $scope.pageNo = params.page();
                $scope.pageCount = params.count();
                console.log("page No page Count: ", $scope.pageNo,
                  $scope.pageCount);
                $defer.resolve($scope.avghealthmsg.slice(
                  (
                    params.page() -
                    1) * params.count(),
                  params.page() *
                  params.count()));
              }
            });
          }

          var showAvgHealthMsgCallback = function (err, data) {
            if (err) {
              return;
            }
            showAvgHealthMsg(data);
          }

          MsgService.getAvgHealthConversations($scope.currApp,
            showAvgHealthMsgCallback);

          $scope.showAvgHealthThread = function (id) {
            $location.path('/apps/' + $scope.currApp +
              '/messages/conversations/' + id);


          }

          $scope.closeConversation = function (coId, user,
            index) {
            MsgService.closeConversationRequest($scope.currApp,
              coId, function (err, user) {
                console.log("coid: ", coId, $scope.avghealthmsg);
                if (err) {
                  console.log("error");
                  return;
                }
                console.log("index: ", index);
                $scope.avghealthmsg.splice(index, 1);
                $scope.tableParamsClosed.reload();
                console.log(
                  "closing open conversation: ",
                  $scope.averageHealthMsg
                  .length);
                if ($scope.avghealthmsg
                  .length == 0) {
                  $scope.showAvgHealthConversations =
                    false;
                }
              });
          }

          $scope.assignTo = function (id) {
            $scope.assignSelect = true;
          }

          $scope.team = AppService.getCurrentApp()
            .team;
          console.log("Appservice getCurrentApp: ",
            AppService.getCurrentApp());
          var assignedTo = function (err, name, index) {
            if (err) {
              return err;
            }
            console.log("$scope.avghealthmsg -->", $scope.avghealthmsg,
              name, index);
            var newIndex = ($scope.pageNo - 1) * $scope.pageCount + index;
            console.log("new index: ", newIndex);
            $scope.avghealthmsg[newIndex].assign = 'Assigned to ' +
              name;
          }

          $scope.assignToMember = function (accId, coId,
            name,
            index) {
            console.log("index: name: ", index, name);
            var data = {
              assignee: accId
            };
            MsgService.assignTo($scope.currApp, coId, data,
              index, name, assignedTo);
          }
        }

        AppModel.getSingleApp($scope.currApp, populatePage);


      })
  }
])

.controller('poorHealthConversationCtrl', ['$scope', 'MsgService',
  'AppService',
  'InboxMsgService', '$moment', '$filter', 'ngTableParams',
  '$log',
  '$location', '$timeout', 'CurrentAppService', '$stateParams', 'AppModel',
  function ($scope, MsgService, AppService, InboxMsgService,
    $moment,
    $filter, ngTableParams, $log, $location, $timeout,
    CurrentAppService, $stateParams, AppModel) {

    CurrentAppService.getCurrentApp()
      .then(function (currentApp) {
        console.log("Promise Resolved: ", currentApp);
        $scope.currApp = $stateParams.id;
        console.log("inside closedConversationCtrl");
        $scope.showPoorHealthConversations = true;
        var msg = [];

        // var populatePage = function () {
        //   function showPoorHealthMsg(msg) {
        //     $scope.poorhealthmsg = [];
        //     // msg = InboxMsgService.getClosedMessage();
        //     if (!msg.length) {
        //       $scope.showPoorHealthConversations = false;
        //     }
        //     console.log("msg show poor health Msg -> -> ", msg);
        //     for (var i = 0; i < msg.length; i++) {
        //       $scope.poorhealthmsg.push({
        //         id: msg[i]._id,
        //         name: msg[i].uid.email,
        //         subject: msg[i].sub,
        //         time: $moment(msg[i].ct)
        //           .fromNow()
        //       })
        //     }
        //     console.log("$scope.data: ", $scope.poorhealthmsg);
        //     $scope.columnsClosed = [{
        //       title: 'User',
        //       field: 'name',
        //       visible: true,
        //       filter: {
        //         'name': 'text'
        //       }
        //     }, {
        //       title: 'Subject',
        //       field: 'subject',
        //       visible: true
        //     }, {
        //       title: 'When',
        //       field: 'time',
        //       visible: true
        //     }];

        //     $scope.refreshTable = function () {
        //       $scope['tableParams'] = {
        //         reload: function () {},
        //         settings: function () {
        //           return {}
        //         }
        //       };
        //       $timeout(setTable, 100)
        //     };
        //     $scope.refreshTable();

        //     function setTable(arguments) {

        //       $scope.tableParamsClosed = new ngTableParams({
        //         page: 1, // show first page
        //         count: 10, // count per page
        //         filter: {
        //           name: '' // initial filter
        //         },
        //         sorting: {
        //           name: 'asc'
        //         }
        //       }, {
        //         filterSwitch: true,
        //         total: $scope.poorhealthmsg.length, // length of data
        //         getData: function ($defer, params) {
        //           var orderedData = params.sorting() ?
        //             $filter('orderBy')($scope.poorhealthmsg,
        //               params.orderBy()) :
        //             $scope.poorhealthmsg;
        //           params.total(orderedData.length);
        //           $defer.resolve(orderedData.slice(
        //             (
        //               params.page() -
        //               1) * params.count(),
        //             params.page() *
        //             params.count()));
        //         }
        //       });
        //     }
        //   }

        //   var showPoorHealthMsgCallback = function (err, data) {
        //     if (err) {
        //       return;
        //     }
        //     showPoorHealthMsg(data);
        //   }

        //   MsgService.getPoorHealthConversations($scope.currApp,
        //     showPoorHealthMsgCallback);

        //   $scope.showPoorHealthThread = function (id) {
        //     $location.path('/apps/' + $scope.currApp +
        //       '/messages/conversations/' + id);


        //   }
        // }

        var populatePage = function () {

          $scope.goToOpenMsg = function () {
            $location.path('/apps/' + $stateParams.id + '/messages/open');
          }

          $scope.goToUnreadMsg = function () {
            $location.path('/apps/' + $stateParams.id + '/messages/unread');
          }

          $scope.goToClosedMsg = function () {
            $location.path('/apps/' + $stateParams.id + '/messages/closed');
          }

          $scope.goToGoodHealth = function () {
            $location.path('/apps/' + $stateParams.id +
              '/messages/goodhealth');
          }

          $scope.goToAvgHealth = function () {
            $location.path('/apps/' + $stateParams.id +
              '/messages/avghealth');
          }

          $scope.goToPoorHealth = function () {
            $location.path('/apps/' + $stateParams.id +
              '/messages/poorhealth');
          }

          function showPoorHealthMsg(msg) {
            $scope.poorhealthmsg = [];
            $scope.poorHealthMsgView = msg
            if (!msg.length) {
              $scope.showPoorHealthConversations = false;
            }
            console.log("msg show poor health Msg -> -> ", msg);

            for (var i = 0; i < msg.length; i++) {
              var m = {
                id: msg[i]._id,
                name: msg[i].uid.email,
                subject: msg[i].sub,
                time: $moment(msg[i].ct)
                  .fromNow(),
                close: 'Close',
                coid: msg[i].coId
              };

              var assignee = msg[i].assignee || {};

              if (assignee.name) {
                m.assign = 'Assigned to ' + assignee.name;
              } else if (assignee.email) {
                m.assign = 'Assigned to ' + assignee.email;
              } else {
                m.assign = 'Assign';
              }

              $scope.poorhealthmsg.push(m);

            };

            console.log("$scope.data: ", $scope.poorhealthmsg);
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
            }, {
              title: '',
              field: 'close',
              visible: 'true'
            }, {
              title: '',
              field: 'assign',
              visible: 'true'
            }];

            $scope.tableParamsClosed = new ngTableParams({
              page: 1, // show first page
              count: 10 // count per page
            }, {
              total: $scope.poorhealthmsg.length, // length of data
              getData: function ($defer, params) {
                $scope.pageNo = params.page();
                $scope.pageCount = params.count();
                console.log("page No page Count: ", $scope.pageNo,
                  $scope.pageCount);
                $defer.resolve($scope.poorhealthmsg.slice(
                  (
                    params.page() -
                    1) * params.count(),
                  params.page() *
                  params.count()));
              }
            });
          }

          var showPoorHealthMsgCallback = function (err, data) {
            if (err) {
              return;
            }
            showPoorHealthMsg(data);
          }

          MsgService.getPoorHealthConversations($scope.currApp,
            showPoorHealthMsgCallback);

          $scope.showAvgHealthThread = function (id) {
            $location.path('/apps/' + $scope.currApp +
              '/messages/conversations/' + id);


          }

          $scope.closeConversation = function (coId, user,
            index) {
            MsgService.closeConversationRequest($scope.currApp,
              coId, function (err, user) {
                console.log("coid: ", coId, $scope.poorhealthmsg);
                if (err) {
                  console.log("error");
                  return;
                }
                console.log("index: ", index);
                $scope.poorhealthmsg.splice(index, 1);
                $scope.tableParamsClosed.reload();
                console.log(
                  "closing open conversation: ",
                  $scope.poorHealthMsgView
                  .length);
                if ($scope.poorhealthmsg
                  .length == 0) {
                  $scope.showPoorHealthConversations =
                    false;
                }
              });
          }

          $scope.assignTo = function (id) {
            $scope.assignSelect = true;
          }

          $scope.team = AppService.getCurrentApp()
            .team;
          console.log("Appservice getCurrentApp: ",
            AppService.getCurrentApp());
          var assignedTo = function (err, name, index) {
            if (err) {
              return err;
            }
            console.log("$scope.poorhealthmsg -->", $scope.poorhealthmsg,
              name, index);
            var newIndex = ($scope.pageNo - 1) * $scope.pageCount + index;
            console.log("new index: ", newIndex);
            $scope.poorhealthmsg[newIndex].assign = 'Assigned to ' +
              name;
          }

          $scope.assignToMember = function (accId, coId,
            name,
            index) {
            console.log("index: name: ", index, name);
            var data = {
              assignee: accId
            };
            MsgService.assignTo($scope.currApp, coId, data,
              index, name, assignedTo);
          }
        }

        AppModel.getSingleApp($scope.currApp, populatePage);


      })
  }
]);