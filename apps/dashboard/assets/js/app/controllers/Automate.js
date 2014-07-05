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
        url: '/apps/:id/messages/automate/test/:mid',
        views: {
          "main": {
            templateUrl: '/templates/messagesmodule/message.automate.test.email.html',
            controller: 'testEmailCtrl',
          }
        },
        authenticate: true

      })
      .state('automateLive', {
        url: '/apps/:id/messages/automate/live/:mid',
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
      .state('automateUpdateTest', {
        url: '/apps/:id/messages/automate/update/test/:mid',
        views: {
          "main": {
            templateUrl: '/templates/messagesmodule/message.automate.update.test.email.html',
            controller: 'updateTestMsgCtrl',
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
              segment: AutoMsgService.getAllAutoMsg()[i].sid.name,
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
              // clicked: AutoMsgService.getAllAutoMsg()[
              //   i].clicked,
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
  'AccountService', 'modelsSegment', '$timeout', '$rootScope',
  function ($scope, saveMsgService, $location, modelsAutomate,
    AppService, segmentService, ErrMsgService, $stateParams,
    AutoMsgService, CurrentAppService, AppModel, AccountService,
    modelsSegment, $timeout, $rootScope) {


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
        $scope.charactersLeft = '250';

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
              return 'http://www.gravatar.com/avatar/' + MD5(email) +
                '.jpg?d=mm';
            }

          $scope.preview = function (string) {
            var locals = {
              user: {
                name: $scope.sender,
                plan: 'enterprise',
                email: $scope.senderEmail
              }
            }

            ejs.open = '{{';
            ejs.close = '}}';
            if (string) {
              var body = string.replace(/&#34;/g, '"');
              var html = ejs.render(body, locals);
              console.log("html: ", html);
              return html;
            }
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
          $scope.senderEmail = AccountService.get()
            .email;
          console.log("sender: ", $scope.sender);
          $scope.senderId = AccountService.get()
            ._id;

          $scope.gravatar = get_gravatar($scope.senderEmail, 60);

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
            $scope.senderEmail = $scope.team[index].accid.email
            $scope.gravatar = get_gravatar($scope.senderEmail, 60);
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
              if ($scope.notificationBody) {
                var checkMsgLengthText = $scope.
                notificationBody.replace(/<(?:.|\n)*?>/gm, '');
                console.log("notification characters: ",
                  checkMsgLengthText);
                var checkMsgLength = checkMsgLengthText.length;
                if (checkMsgLength > 250) {
                  $rootScope.error = true;
                  $rootScope.errMsgRootScope =
                    'Maximum characters in a notification can be 250';
                  $timeout(function () {
                    $rootScope.errMsgRootScope = '';
                    $rootScope.error = false;
                  }, 5000);
                  return;
                }
                saveMsgService.setMsg($scope.notificationBody.replace(
                    /\n/g,
                    '<br/>')
                  .replace(/&#34;/g, '"')
                  .replace(/&#160/g, ' '));
              }
              saveMsgService.setTitle($scope.title);
              saveMsgService.setSub('');
            }

            if ($scope.showEmail) {
              saveMsgService.setMsg($scope.emailBody.replace(/\n/g,
                  '<br/>')
                .replace(/&#34;/g, '"')
                .replace(/&#160;/g, ' '));
              console.log("Msg: ", saveMsgService.getMsg());
              if ($scope.subject != null) {
                saveMsgService.setSub($scope.subject.replace(
                    /<(?:.|\n)*?>/gm, '')
                  .replace(/&#34;/g, '"')
                  .replace(/&#160;/g, ' '));
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
          }

          $scope.showText = function (htmlVariable) {
            console.log($scope.htmlVariable);
            var checkMsgLengthText = $scope.
            notificationBody.replace(/<(?:.|\n)*?>/gm, '')
              .replace(/&#34;/g, '"')
              .replace(/&#160;/g, ' ');
            console.log("notification characters: ",
              checkMsgLengthText);
            var checkMsgLength = checkMsgLengthText.length;
            $scope.charactersLeft = 250 - checkMsgLength;
            if ($scope.charactersLeft < 10) {
              $scope.colorText = '#e74c3c';
            }
            if ($scope.charactersLeft >= 10) {
              $scope.colorText = '#2c3e50';
            }
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
  'AccountService', '$rootScope', '$timeout',
  function ($scope, saveMsgService, $location, modelsAutomate,
    AppService, segmentService, ErrMsgService, $stateParams,
    AutoMsgService, CurrentAppService, AppModel, AccountService, $rootScope,
    $timeout) {




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

    var populatePage = function () {

      var populateAutoMsg = function () {
        console.log("AutoMsgService getSingleAutoMsg: ",
          AutoMsgService.getSingleAutoMsg());
        // $scope.email = "savinay@dodatado.com";
        $scope.senderEmail = AutoMsgService.getSingleAutoMsg()
          .sender.email;

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
          return 'http://www.gravatar.com/avatar/' + MD5(email) +
            '.jpg?d=mm';
        }

        $scope.preview = function (string) {
          var locals = {
            user: {
              name: $scope.sender,
              plan: 'enterprise',
              email: $scope.senderEmail
            }
          }

          ejs.open = '{{';
          ejs.close = '}}';
          if (string) {
            var body = string.replace(/&#34;/g, '"');
            var html = ejs.render(body, locals);
            console.log("html: ", html);
            return html;
          }
        }

        $scope.gravatar = get_gravatar($scope.senderEmail, 60);
        if (AutoMsgService.getSingleAutoMsg()
          .type === 'notification') {
          $scope.showNotification = true;
          $scope.selectedMessageType = {
            icon: "fa fa-bell",
            value: "Notification"
          };
          $scope.notificationBody = AutoMsgService.getSingleAutoMsg()
            .body;
          var notificationTextLength = $scope.notificationBody.replace(
            /<(?:.|\n)*?>/gm, '')
            .replace(/&#34;/g, '"')
            .replace(/&#160;/g, ' ')
            .length;
          console.log("notificationTextLength: ", notificationTextLength);
          $scope.charactersLeft = 250 - notificationTextLength;
          if ($scope.charactersLeft < 10) {
            $scope.colorText = '#e74c3c';
          }
          if ($scope.charactersLeft >= 10) {
            $scope.colorText = '#2c3e50';
          }


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
        $scope.segment = AutoMsgService.getSingleAutoMsg()
          .sid.name;
        $scope.colorTheme = AppService.getCurrentApp()
          .color;
        console.log("color theme: ", $scope.colorTheme);
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
            var checkMsgLengthText = $scope.
            notificationBody.replace(/<(?:.|\n)*?>/gm, '');
            console.log("notification characters: ", checkMsgLengthText);
            var checkMsgLength = checkMsgLengthText.length;
            if (checkMsgLength > 250) {
              $rootScope.error = true;
              $rootScope.errMsgRootScope =
                'Maximum characters in a notification can be 250';
              $timeout(function () {
                $rootScope.errMsgRootScope = '';
                $rootScope.error = false;
              }, 5000);
              return;
            }
            saveMsgService.setMsg($scope.notificationBody.replace(/\n/g,
                '<br/>')
              .replace(/&#34;/g, '"')
              .replace(/&#160;/g, ' '));
            saveMsgService.setTitle($scope.title);
            saveMsgService.setSub('');
          }

          if ($scope.showEmail) {
            saveMsgService.setMsg($scope.emailBody.replace(/\n/g, '<br/>')
              .replace(/&#34;/g, '"')
              .replace(/&#160;/g, ' '));
            if ($scope.subject != null) {
              saveMsgService.setSub($scope.subject.replace(
                  /<(?:.|\n)*?>/gm, '')
                .replace(/&#34;/g, '"')
                .replace(/&#160;/g, ' '));
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
          var checkMsgLengthText = $scope.
          notificationBody.replace(/<(?:.|\n)*?>/gm, '')
            .replace(/&#34;/g, '"')
            .replace(/&#160;/g, ' ');
          console.log("notification characters: ",
            checkMsgLengthText);
          var checkMsgLength = checkMsgLengthText.length;
          $scope.charactersLeft = 250 - checkMsgLength;
          if ($scope.charactersLeft < 10) {
            $scope.colorText = '#e74c3c';
          }
          if ($scope.charactersLeft >= 10) {
            $scope.colorText = '#2c3e50';
          }
        }

        $scope.hideErrorAlert = function () {
          $scope.showAutoMsgError = false;
        }
      }

      modelsAutomate.getSingleAutoMsg($scope.currApp, $scope
        .msgId,
        populateAutoMsg);


    }

    AppModel.getSingleApp($scope.currApp, populatePage);




  }
])

.controller('testEmailCtrl', ['$scope', 'saveMsgService', 'modelsAutomate',
  'AppService', 'AutoMsgService', '$stateParams', '$location', 'AppModel',
  function ($scope, saveMsgService, modelsAutomate, AppService,
    AutoMsgService, $stateParams, $location, AppModel) {
    $scope.enableSendTest = true;
    $scope.currApp = $stateParams.id;
    $scope.msgId = $stateParams.mid;

    var populatePage = function () {
      $scope.colorTheme = AppService.getCurrentApp()
        .color;
      $scope.emailBorderColor = $scope.colorTheme;
      $scope.emailBorderRight = '1px solid' + $scope.colorTheme;
      $scope.emailBorderTop = '1px solid' + $scope.colorTheme;
      $scope.emailBorderBottom = '1px solid' + $scope.colorTheme;
      $scope.borderRadius = '4px';
      $scope.borderBottom = '1px solid' + $scope.colorTheme;

      // $scope.msgType = AutoMsgService.getAutoMsgType();
      if ($scope.msgType === "Email") {
        $scope.showEmailPreview = true;
      }

      if ($scope.msgType === "Notification") {
        $scope.showNotificationPreview = true;
      }

      var showAutoMsgCallback = function (err) {
        if (err) {
          console.log("err");
          return;
        }
        console.log("inside showAutoMsgCallback");
        console.log("single automsg ------>>>>>>>: ", AutoMsgService.getSingleAutoMsg());
        $scope.msgType = AutoMsgService.getSingleAutoMsg()
          .type;
        $scope.subject = AutoMsgService.getSingleAutoMsg()
          .sub;
        $scope.previewText = AutoMsgService.getSingleAutoMsg()
          .body;
      }

      modelsAutomate.getSingleAutoMsg($scope.currApp, $scope.msgId,
        showAutoMsgCallback);

      var callback = function (err) {
        if (err) {
          console.log("err");
          return;
        }
        $scope.enableSendTest = true;
        $location.path('/apps/' + $scope.currApp +
          '/messages/automate/live/' + $scope.msgId);
      }

      $scope.preview = function (string) {
        var locals = {
          user: {
            name: AutoMsgService.getSingleAutoMsg()
              .sender.name,
            plan: 'enterprise',
            email: AutoMsgService.getSingleAutoMsg()
              .sender.email
          }
        }

        ejs.open = '{{';
        ejs.close = '}}';
        if (string) {
          var body = string.replace(/&#34;/g, '"');
          var html = ejs.render(body, locals);
          console.log("html: ", html);
          return html;
        }
      }

      $scope.sendTestEmail = function () {
        $scope.enableSendTest = false;
        modelsAutomate.sendTestEmail($scope.currApp, AutoMsgService.getSingleAutoMsg()
          ._id, callback);
      }

    }

    AppModel.getSingleApp($scope.currApp, populatePage);
  }
])

.controller('liveEmailCtrl', ['$scope', 'saveMsgService', 'modelsAutomate',
  'AppService', 'AutoMsgService', '$stateParams', '$location', 'AppModel',
  function ($scope, saveMsgService, modelsAutomate, AppService,
    AutoMsgService, $stateParams, $location, AppModel) {
    $scope.currApp = $stateParams.id;
    console.log("$scope.currApp ------>>>>>>", $scope.currApp,
      $stateParams.id);

    $scope.msgId = $stateParams.mid;
    $scope.statusButton = false;

    var populatePage = function () {
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
          return 'http://www.gravatar.com/avatar/' + MD5(email) +
            '.jpg?d=mm';
        }
        $scope.senderEmail = AutoMsgService.getSingleAutoMsg()
          .sender.email;
        $scope.sender = AutoMsgService.getSingleAutoMsg()
          .sender.name;
        $scope.gravatar = get_gravatar($scope.senderEmail, 60);

        $scope.preview = function (string) {
          var locals = {
            user: {
              name: $scope.sender,
              plan: 'enterprise',
              email: $scope.senderEmail
            }
          }

          ejs.open = '{{';
          ejs.close = '}}';
          if (string) {
            var body = string.replace(/&#34;/g, '"');
            var html = ejs.render(body, locals);
            console.log("html: ", html);
            return html;
          }
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

        if ($scope.msgType === "email") {
          $scope.showEmailPreview = true;
        }

        if ($scope.msgType === "notification") {
          $scope.showNotificationPreview = true;
        }

        if (AutoMsgService.getSingleAutoMsg()
          .active) {
          console.log("message is active");
          $scope.msgStatus = 'Deactivate this Message';
        } else {
          console.log("message is inactive");
          $scope.msgStatus = 'Make it Live';
        }

      }

      modelsAutomate.getSingleAutoMsg($scope.currApp, $scope.msgId,
        showAutoMsgCallback);

      $scope.goToAutoMessages = function () {
        $location.path('/apps/' + $scope.currApp + '/messages/automate');
      }

      var callbackMakeLive = function (err) {
        $scope.statusButton = false;
        if (err) {
          console.log("err");
          return;
        }
        $scope.msgStatus = 'Deactivate this Message';
        console.log("$scope.msgStatus: ", $scope.msgStatus);

      }

      var callbackDeactivate = function (err) {
        $scope.statusButton = false;
        if (err) {
          console.log("err");
          return;
        }
        $scope.msgStatus = 'Make it Live';
        console.log("$scope.msgStatus: ", $scope.msgStatus);
      }

      $scope.changeMsgStatus = function () {
        $scope.statusButton = true;
        console.log("single AutoMsg: ", AutoMsgService.getSingleAutoMsg());
        console.log(_.keys(AutoMsgService.getSingleAutoMsg()));
        if (AutoMsgService.getSingleAutoMsg()
          .active == true) {
          console.log("message is active");
          modelsAutomate.deActivateMsg($scope.currApp,
            $scope.msgId, callbackDeactivate);
        } else {
          console.log("message is inactive");
          modelsAutomate.makeMsgLive($scope.currApp, $scope.msgId,
            callbackMakeLive);
        }
      }

    }

    AppModel.getSingleApp($scope.currApp, populatePage);
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

.controller('updateTestMsgCtrl', ['$scope', 'saveMsgService', 'modelsAutomate',
  'AppService', 'AutoMsgService', '$stateParams', '$location', 'AppModel',
  function ($scope, saveMsgService, modelsAutomate, AppService,
    AutoMsgService, $stateParams, $location, AppModel) {
    $scope.enableSendTest = true;
    $scope.currApp = $stateParams.id;
    $scope.msgId = $stateParams.mid;
    var populatePage = function () {

      var showAutoMsgCallback = function (err) {
        if (err) {
          console.log("err");
          return;
        }
        console.log("inside showAutoMsgCallback");
        console.log("single automsg ------>>>>>>>: ", AutoMsgService.getSingleAutoMsg());
        $scope.msgType = AutoMsgService.getSingleAutoMsg()
          .type;
        $scope.subject = AutoMsgService.getSingleAutoMsg()
          .sub;
        $scope.previewText = AutoMsgService.getSingleAutoMsg()
          .body;
      }

      $scope.goToAutoMessages = function () {
        $location.path('/apps/' + $scope.currApp + '/messages/automate');
      }

      modelsAutomate.getSingleAutoMsg($scope.currApp, $scope.msgId,
        showAutoMsgCallback);

      var callback = function (err) {
        if (err) {
          $rootScope.error = true;
          $rootScope.errMsgRootScope = err;
          $timeout(function () {
            $rootScope.error = false;
            $rootScope.errMsgRootScope = '';
          }, 5000);
          console.log("err");
          return;
        }
        $scope.enableSendTest = true;
        // $location.path('/apps/' + $scope.currApp +
        //   '/messages/automate');
        $rootScope.success = true;
        $rootScope.successMsgRootScope = 'A test email has been sent to you';
        $timeout(function () {
          $rootScope.success = false;
          $rootScope.successMsgRootScope = '';
        }, 5000);
      }

      $scope.sendTestEmail = function () {
        $scope.enableSendTest = false;
        modelsAutomate.sendTestEmail($scope.currApp, AutoMsgService.getSingleAutoMsg()
          ._id, callback);
      }

    }

    AppModel.getSingleApp($scope.currApp, populatePage);
  }
])