angular.module('do.automate', [])

.config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('automate', {
        url: '/apps/:id/messages/automate',
        views: {
          "main": {
            templateUrl: '/templates/messagesmodule/message.compose.automate.html',
            controller: 'messageAutomateCtrl',
          }
        },
        authenticate: true

      })
      .state('automateSegment', {
        url: '/apps/:id/messages/automate/segments',
        views: {
          "main": {
            templateUrl: '/templates/messagesmodule/message.automate.segment.html',
            controller: 'automateSegmentCtrl',
          }
        },
        authenticate: true

      })
      .state('automateWrite', {
        url: '/apps/:id/messages/automate/segments/:sid/write',
        views: {
          "main": {
            templateUrl: '/templates/messagesmodule/message.compose.automate.write.html'
          }
        },
        authenticate: true

      })
      .state('automateUpdate', {
        url: '/apps/:id/messages/automate/:mid/update',
        views: {
          "main": {
            templateUrl: '/templates/messagesmodule/message.automate.update.html',
            controller: 'updateAutoMsgCtrl'
          }
        },
        authenticate: true

      })
      .state('automateTest', {
        url: '/apps/:id/messages/automate/test',
        views: {
          "main": {
            templateUrl: '/templates/messagesmodule/message.automate.test.email.html',
            controller: 'testEmailCtrl',
          }
        },
        authenticate: true

      })
      .state('automateLive', {
        url: '/apps/:id/messages/automate/live',
        views: {
          "main": {
            templateUrl: '/templates/messagesmodule/message.automate.live.html',
            controller: 'liveEmailCtrl',
          }
        },
        authenticate: true

      })
      .state('automateStatus', {
        url: '/apps/:id/messages/automate/status/:mid',
        views: {
          "main": {
            templateUrl: '/templates/messagesmodule/message.automate.status.html',
            controller: 'statusMsgCtrl',
          }
        },
        authenticate: true

      })
  }
])

.controller('messageAutomateCtrl', ['$scope', '$location', 'segment',
  'queryMatching', '$filter', 'AutoMsgService', 'modelsAutomate',
  'AppService', 'CurrentAppService', '$stateParams',
  function ($scope, $location, segment, queryMatching, $filter,
    AutoMsgService, modelsAutomate, AppService, CurrentAppService,
    $stateParams) {

    CurrentAppService.getCurrentApp()
      .then(function (currentApp) {
        $scope.currApp = $stateParams.id;
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
        modelsAutomate.getAllAutoMessages($scope.currApp,
          populateAutoMsg);

        $scope.showAutoMsg = function (index) {
          $location.path('/apps/' + $scope.currApp +
            '/messages/automate/' + $scope.automessages[
              index].id + '/update');
        }

        $scope.changeMsgStatus = function (id, text, index) {
          if (text == 'Activate') {
            modelsAutomate.makeMsgLive($scope.currApp, id);
            // FIXME: The message should be changed to Deactivate when its a success. Have a callback for this.
            $scope.automessages[index].message =
              'Deactivate';
          }

          if (text == 'Deactivate') {
            // FIXME: The message should be changed to Activate when its a success. Have a callback for this.
            modelsAutomate.deActivateMsg($scope.currApp,
              id);
            $scope.automessages[index].message =
              'Activate';
          }
        }

        $scope.editAutoMessage = function (id, index) {
          $location.path('/apps/' + $scope.currApp +
            '/messages/automate/' + id + '/update');
          // modelsAutomate.editAutoMsg($scope.currApp, id, index);
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
  'AppService', 'segmentService', 'CurrentAppService', '$stateParams',
  'AppModel',
  function ($scope, segment, modelsSegment, AppService, segmentService,
    CurrentAppService, $stateParams, AppModel) {

    CurrentAppService.getCurrentApp()
      .then(function (currentApp) {
        $scope.currApp = $stateParams.id;
        $scope.segments = [];
        $scope.segmenticons = [];
        $scope.selectedIcon = [];

        var populatePage = function () {
          var checkSegments = function (err) {
            if (err) {
              return err;
            }
            $scope.selectedIcon._id = segmentService.getSegments()[
              0]._id;
            $scope.sid = $scope.selectedIcon._id;
            $scope.selectedIcon.name = segmentService.getSegments()[
              0].name;
            if (segmentService.getSegments()
              .length > 0) {
              for (var i = 0; i < segmentService.getSegments()
                .length; i++) {
                $scope.segmenticons.push({
                  value: segmentService.getSegments()[
                    i].name,
                  label: segmentService.getSegments()[
                    i].name,
                  id: segmentService.getSegments()[
                    i]
                    ._id
                })
              };
            }
          }

          modelsSegment.getAllSegments($scope.currApp,
            checkSegments);
          $scope.changeText = function (ind) {
            $scope.selectedIcon._id = $scope.segmenticons[
              ind].id;
            $scope.sid = $scope.selectedIcon._id;
            $scope.selectedIcon.name = $scope.segmenticons[
              ind]
              .label;
          }

          $scope.storeSegment = function () {
            segmentService.setSingleSegment($scope.selectedIcon);
            console.log("single segment: ", segmentService
              .getSingleSegment());
          }
        }
        AppModel.getSingleApp($scope.currApp, populatePage);

      })

  }
])

.controller('textAngularCtrl', ['$scope', 'saveMsgService', '$location',
  'modelsAutomate', 'AppService', 'segmentService', 'ErrMsgService',
  '$stateParams', 'AutoMsgService', 'CurrentAppService', 'AppModel',
  'AccountService', 'modelsSegment',
  function ($scope, saveMsgService, $location, modelsAutomate,
    AppService, segmentService, ErrMsgService, $stateParams,
    AutoMsgService, CurrentAppService, AppModel, AccountService,
    modelsSegment) {


    CurrentAppService.getCurrentApp()
      .then(function (currentApp) {


        console.log("inside text Angular Ctrl");
        console.log("sid: ", segmentService.getSingleSegment()
          ._id);
        $scope.currApp = $stateParams.id;
        $scope.segid = $stateParams.sid;
        $scope.showNotification = true;
        $scope.showEmail = false;
        $scope.showAutoMsgError = false;

        var populatePage = function () {
          // $scope.email = "savinay@dodatado.com";

          var cb = function (err) {
            if (err) {
              return err;
            }
            console.log("success in getting a segment");
            $scope.segment = segmentService.getSingleSegment()
              .name;
          }
          modelsSegment.getSegment($scope.currApp, $scope.segid, cb);
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

          $scope.sender = AccountService.get()
            .name;
          console.log("sender: ", $scope.sender);
          $scope.senderId = AccountService.get()
            ._id;

          $scope.team = AppService.getCurrentApp()
            .team;

          $scope.colorTheme = AppService.getCurrentApp()
            .color;
          $scope.borderColor = $scope.colorTheme;
          $scope.borderRight = '1px solid' + $scope.colorTheme;
          $scope.borderTop = '1px solid' + $scope.colorTheme;
          $scope.borderBottom = '1px solid' + $scope.colorTheme;
          $scope.borderRadius = '4px';
          $scope.backGrndColor = $scope.colorTheme;
          $scope.borderColor = $scope.colorTheme;

          $scope.emailBorderColor = $scope.colorTheme;
          $scope.emailBorderRight = '1px solid' + $scope.colorTheme;
          $scope.emailBorderTop = '1px solid' + $scope.colorTheme;
          $scope.emailBorderBottom = '1px solid' + $scope.colorTheme;

          $scope.changeFromEmailText = function (index) {
            $scope.sender = $scope.team[index].accid.name;
            $scope.senderId = $scope.team[index].accid._id;
          }

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

            if ($scope.selectedMessageType.value ===
              "Email") {
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
              if ($scope.subject != null) {
                saveMsgService.setSub($scope.subject.replace(
                  /<(?:.|\n)*?>/gm, ''));
              }
              saveMsgService.setTitle($scope.title);
              console.log("email body: ", saveMsgService
                .getMsg());
              console.log("email subject: ",
                saveMsgService.getSub());
              // console.log("msg: ",saveMsgService)
            }

            AutoMsgService.setAutoMsgType($scope.selectedMessageType
              .value);
            console.log("auto MSg type ----->>>>>>>>: ",
              AutoMsgService.getAutoMsgType());

            var data = {
              body: saveMsgService.getMsg(),
              sub: saveMsgService.getSub(),
              title: saveMsgService.getTitle(),
              type: $scope.selectedMessageType.value.toLowerCase(),
              sid: $stateParams.sid,
              sender: $scope.senderId
            }

            console.log("data: ", data);
            modelsAutomate.saveAutoMsg($scope.currApp,
              data);
            /*                        $scope.$watch(ErrMsgService.getErrorMessage,
                            function () {
                                if (ErrMsgService.getErrorMessage()) {
                                    $scope.showAutoMsgError = true;
                                    $scope.errMsg = ErrMsgService.getErrorMessage();
                                }
                            })*/
          }

          $scope.showText = function (htmlVariable) {
            console.log($scope.htmlVariable);
          }

          $scope.hideErrorAlert = function () {
            $scope.showAutoMsgError = false;
          }
        }

        AppModel.getSingleApp($scope.currApp, populatePage);
      })



  }
])

.controller('updateAutoMsgCtrl', ['$scope', 'saveMsgService', '$location',
  'modelsAutomate', 'AppService', 'segmentService', 'ErrMsgService',
  '$stateParams', 'AutoMsgService', 'CurrentAppService', 'AppModel',
  'AccountService',
  function ($scope, saveMsgService, $location, modelsAutomate,
    AppService, segmentService, ErrMsgService, $stateParams,
    AutoMsgService, CurrentAppService, AppModel, AccountService) {




    console.log("inside update Auto Msg Ctrl");
    console.log("sid: ", segmentService.getSingleSegment());
    $scope.currApp = $stateParams.id;
    $scope.msgId = $stateParams.mid;
    $scope.showNotification = false;
    $scope.showEmail = false;
    $scope.showAutoMsgError = false;

    $scope.doTheBack = function () {
      window.history.back();
    }

    var populateAutoMsg = function () {
      console.log("AutoMsgService getSingleAutoMsg: ",
        AutoMsgService.getSingleAutoMsg());
      // $scope.email = "savinay@dodatado.com";

      if (AutoMsgService.getSingleAutoMsg()
        .type === 'notification') {
        $scope.showNotification = true;
        $scope.selectedMessageType = {
          icon: "fa fa-bell",
          value: "Notification"
        };
        $scope.notificationBody = AutoMsgService.getSingleAutoMsg()
          .body;

      } else {
        $scope.showEmail = true;
        $scope.selectedMessageType = {
          icon: "fa fa-envelope",
          value: "Email"
        };
        $scope.emailBody = AutoMsgService.getSingleAutoMsg()
          .body;
        $scope.subject = AutoMsgService.getSingleAutoMsg()
          .sub;
      }

      $scope.sender = AutoMsgService.getSingleAutoMsg()
        .sender.name;


      console.log("selectedIcon: ", $scope.selectedMessageType);
      $scope.title = AutoMsgService.getSingleAutoMsg()
        .title;
      $scope.segment = AutoMsgService.getSingleAutoMsg().sid.name;
      $scope.colorTheme = AppService.getCurrentApp()
        .color;
      $scope.borderColor = $scope.colorTheme;
      $scope.borderRight = '1px solid' + $scope.colorTheme;
      $scope.borderTop = '1px solid' + $scope.colorTheme;
      $scope.borderBottom = '1px solid' + $scope.colorTheme;
      $scope.borderRadius = '4px';
      $scope.backGrndColor = $scope.colorTheme;
      $scope.borderColor = $scope.colorTheme;

      $scope.emailBorderColor = $scope.colorTheme;
      $scope.emailBorderRight = '1px solid' + $scope.colorTheme;
      $scope.emailBorderTop = '1px solid' + $scope.colorTheme;
      $scope.emailBorderBottom = '1px solid' + $scope.colorTheme;

      $scope.updateMessage = function () {
        if ($scope.showNotification) {
          saveMsgService.setMsg($scope.notificationBody);
          saveMsgService.setTitle($scope.title);
        }

        if ($scope.showEmail) {
          saveMsgService.setMsg($scope.emailBody);
          if ($scope.subject != null) {
            saveMsgService.setSub($scope.subject.replace(
              /<(?:.|\n)*?>/gm, ''));
          }
          saveMsgService.setTitle($scope.title);
          console.log("email body: ", saveMsgService
            .getMsg());
          console.log("email subject: ",
            saveMsgService.getSub());
          // console.log("msg: ",saveMsgService)
        }

        AutoMsgService.setAutoMsgType($scope.selectedMessageType
          .value);
        console.log("auto MSg type ----->>>>>>>>: ",
          AutoMsgService.getAutoMsgType());

        var data = {
          body: saveMsgService.getMsg(),
          sub: saveMsgService.getSub(),
          title: saveMsgService.getTitle()
        }

        console.log("data: ", data);
        modelsAutomate.editAutoMsg($scope.currApp, $scope.msgId,
          data);
      }

      $scope.showText = function (htmlVariable) {
        console.log($scope.htmlVariable);
      }

      $scope.hideErrorAlert = function () {
        $scope.showAutoMsgError = false;
      }
    }

    modelsAutomate.getSingleAutoMsg($scope.currApp, $scope
      .msgId,
      populateAutoMsg);




  }
])

.controller('testEmailCtrl', ['$scope', 'saveMsgService', 'modelsAutomate',
  'AppService', 'AutoMsgService', '$stateParams',
  function ($scope, saveMsgService, modelsAutomate, AppService,
    AutoMsgService, $stateParams) {
    $scope.currApp = $stateParams.id;
    $scope.previewText = saveMsgService.getMsg();
    console.log(saveMsgService.getMsg());
    $scope.subject = saveMsgService.getSub();
    console.log("auto test email subject ----->>>>>>: ",
      saveMsgService.getSub());
    $scope.colorTheme = AppService.getCurrentApp()
      .color;
    $scope.emailBorderColor = $scope.colorTheme;
    $scope.emailBorderRight = '1px solid' + $scope.colorTheme;
    $scope.emailBorderTop = '1px solid' + $scope.colorTheme;
    $scope.emailBorderBottom = '1px solid' + $scope.colorTheme;
    $scope.borderRadius = '4px';
    $scope.borderBottom = '1px solid' + $scope.colorTheme;

    $scope.msgType = AutoMsgService.getAutoMsgType();
    if ($scope.msgType === "Email") {
      $scope.showEmailPreview = true;
    }

    if ($scope.msgType === "Notification") {
      $scope.showNotificationPreview = true;
    }
    $scope.sendTestEmail = function () {
      modelsAutomate.sendTestEmail($scope.currApp, AutoMsgService.getSingleAutoMsg()
        ._id);
    }
  }
])

.controller('liveEmailCtrl', ['$scope', 'saveMsgService', 'modelsAutomate',
  'AppService', 'AutoMsgService', '$stateParams',
  function ($scope, saveMsgService, modelsAutomate, AppService,
    AutoMsgService, $stateParams) {
    $scope.currApp = $stateParams.id;
    console.log("$scope.currApp ------>>>>>>", $scope.currApp,
      $stateParams.id);
    // $scope.preview = saveMsgService.getMsg();
    $scope.previewText = saveMsgService.getMsg();
    console.log(saveMsgService.getMsg());
    $scope.subject = saveMsgService.getSub();
    console.log("auto test email subject ----->>>>>>: ",
      saveMsgService.getSub());

    $scope.msgType = AutoMsgService.getAutoMsgType();
    if ($scope.msgType === "Email") {
      $scope.showEmailPreview = true;
    }

    if ($scope.msgType === "Notification") {
      $scope.showNotificationPreview = true;
    }
    $scope.msgId = AutoMsgService.getSingleAutoMsg()
      ._id;
    if (AutoMsgService.getSingleAutoMsg()
      .active) {
      $scope.msgStatus = 'Deactivate this Message';
    } else {
      $scope.msgStatus = 'Make it Live';
    }

    $scope.colorTheme = AppService.getCurrentApp()
      .color;
    $scope.borderColor = $scope.colorTheme;
    $scope.borderRight = '1px solid' + $scope.colorTheme;
    $scope.borderTop = '1px solid' + $scope.colorTheme;
    $scope.borderBottom = '1px solid' + $scope.colorTheme;
    $scope.borderRadius = '4px';
    $scope.backGrndColor = $scope.colorTheme;
    $scope.borderColor = $scope.colorTheme;

    $scope.emailBorderColor = $scope.colorTheme;
    $scope.emailBorderRight = '1px solid' + $scope.colorTheme;
    $scope.emailBorderTop = '1px solid' + $scope.colorTheme;
    $scope.emailBorderBottom = '1px solid' + $scope.colorTheme;

    $scope.changeMsgStatus = function () {
      if (AutoMsgService.getSingleAutoMsg()
        .active) {
        modelsAutomate.deActivateMsg($scope.currApp,
          $scope.msgId);
        $scope.msgStatus = 'Make it Live';
      } else {
        modelsAutomate.makeMsgLive($scope.currApp, $scope.msgId);
        $scope.msgStatus = 'Deactivate this Message';
      }
    }
  }
])

.controller('statusMsgCtrl', ['$scope', 'saveMsgService', 'modelsAutomate',
  'AppService', 'AutoMsgService', '$stateParams', '$location',
  function ($scope, saveMsgService, modelsAutomate, AppService,
    AutoMsgService, $stateParams, $location) {
    $scope.currApp = $stateParams.id;
    $scope.msgId = $stateParams.mid;
    var showAutoMsgCallback = function (err) {
      if (err) {
        console.log("err");
        return err;
      }
      console.log("inside showAutoMsgCallback");
      console.log("single automsg ------>>>>>>>: ", AutoMsgService.getSingleAutoMsg());
      $scope.msgType = AutoMsgService.getSingleAutoMsg()
        .type;
      $scope.subject = AutoMsgService.getSingleAutoMsg()
        .sub;
      $scope.previewText = AutoMsgService.getSingleAutoMsg()
        .body;

      $scope.colorTheme = AppService.getCurrentApp()
        .color;
      $scope.borderColor = $scope.colorTheme;
      $scope.borderRight = '1px solid' + $scope.colorTheme;
      $scope.borderTop = '1px solid' + $scope.colorTheme;
      $scope.borderBottom = '1px solid' + $scope.colorTheme;
      $scope.borderRadius = '4px';
      $scope.backGrndColor = $scope.colorTheme;
      $scope.borderColor = $scope.colorTheme;

      $scope.emailBorderColor = $scope.colorTheme;
      $scope.emailBorderRight = '1px solid' + $scope.colorTheme;
      $scope.emailBorderTop = '1px solid' + $scope.colorTheme;
      $scope.emailBorderBottom = '1px solid' + $scope.colorTheme;

      if ($scope.msgType === "email") {
        $scope.showEmailPreview = true;
      }

      if ($scope.msgType === "notification") {
        $scope.showNotificationPreview = true;
      }

      if (AutoMsgService.getSingleAutoMsg()
        .active) {
        $scope.msgStatus = 'Deactivate this Message';
      } else {
        $scope.msgStatus = 'Make it Live';
      }

    }

    modelsAutomate.getSingleAutoMsg($scope.currApp, $scope.msgId,
      showAutoMsgCallback);

    $scope.changeAutoMsgStatus = function () {
      console.log("automsgstatus: ", AutoMsgService.getSingleAutoMsg()
        .active);
      if (AutoMsgService.getSingleAutoMsg()
        .active) {
        modelsAutomate.deActivateMsg($scope.currApp,
          $scope.msgId);
        $scope.msgStatus = 'Make it Live';
        $location.path('/apps/' + $scope.currApp + '/messages/automate');
      } else {
        modelsAutomate.makeMsgLive($scope.currApp, $scope.msgId);
        $scope.msgStatus = 'Deactivate this Message';
        $location.path('/apps/' + $scope.currApp + '/messages/automate');
      }
    }

    console.log("$scope.currApp ------>>>>>>", $scope.currApp,
      $stateParams.id);

  }
])