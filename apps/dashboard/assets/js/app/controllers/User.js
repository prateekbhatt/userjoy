angular.module('do.users', [])

.config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('users', {
        url: '/users',
        views: {
          "main": {
            templateUrl: '/templates/usersmodule/users.html'
          }
        },
        authenticate: true
      })
      .state('users.segment', {
        url: '/segment',
        views: {
          "panel": {
            templateUrl: '/templates/usersmodule/users.segment.html',
            controller: 'UserSegmentCtrl'
          }
        },
        authenticate: true
      })
      .state('list', {
        url: '/apps/:id/users/list',
        views: {
          "main": {
            templateUrl: '/templates/usersmodule/users.list.html',
            controller: 'UserListCtrl'
          },
          "panel": {
            templateUrl: '/templates/usersmodule/users.list.table.html',
            controller: 'TableCtrl'
          }
        },
        authenticate: true

      })
      .state('profile', {
        url: '/apps/:aid/users/profile/:id',
        views: {
          "main": {
            templateUrl: '/templates/usersmodule/users.profile.html',
            controller: 'ProfileCtrl',
          }
        },
        authenticate: true

      });

  }
])

// .controller('UserSegmentCtrl', ['$scope', '$location', 'segment',
//     'queryMatching', '$filter', 'countOfActions', 'hasNotDone',
//     'hasDoneActions', 'ngTableParams',
//     function ($scope, $location, segment, queryMatching, $filter,
//         countOfActions, hasNotDone, hasDoneActions,
//         ngTableParams) {


//         $scope.state = 'form-control';
//         $scope.isErr = '';
//         $scope.method = 'count';
//         $scope.checkMethod = true;
//         $scope.rootOperator = 'and';
//         $scope.newFilterArray = [{
//                 method: 'hasdone',
//                 name: 'Create new chat',
//                 op: '',
//                 val: ''
//             },

//             {
//                 method: 'count',
//                 name: 'Logged In',
//                 op: 'gt',
//                 val: 20
//             }
//         ]


//         $scope.selectFilter = 'Users';
//         $scope.hasNotDoneItems = [];
//         $scope.hasNotDoneItems = hasNotDone.getAllHasNotDoneActions();
//         $scope.hasDoneItems = [];
//         $scope.hasDoneItems = hasDoneActions.getAllHasDoneActions();
//         $scope.countOfItems = [];
//         $scope.countOfItems = countOfActions.getCountOfActions();
//         $scope.hasDoneOrHasNotDoneClicked = false;
//         $scope.hasCountOfClicked = true;

//         $scope.changeFilterHasDone = function (parentindex, index, evt) {
//             $scope.method = 'hasdone';
//             $scope.filters[parentindex].checkMethod = false;
//             console.log("has done: ", parentindex);
//             $scope.filters[parentindex].btntext = 'Has Done';
//             $scope.filters[parentindex].method = 'hasdone';
//             $scope.filters[parentindex].name = $scope.hasDoneItems[index].name;
//             $scope.filters[parentindex].op = '';
//             $scope.filters[parentindex].optext = '';
//             $scope.filters[parentindex].val = '';


//             $scope.hasDoneOrHasNotDone = true;
//             $scope.textHasDoneNotHasDone = $scope.hasDoneItems[index].name;
//             $scope.hasDoneOrHasNotDoneClicked = true;
//             $scope.hasCountOfClicked = false;
//             $scope.selectFilterHasOrHasNotDone = 'Has done ';
//             console.log("index: ", index);
//         }

//         $scope.changeFilterHasNotDone = function (parentindex, index, evt) {
//             $scope.method = 'hasnotdone';
//             $scope.filters[parentindex].checkMethod = false;
//             console.log("has not done: ", parentindex);
//             $scope.filters[parentindex].method = 'hasnotdone';
//             $scope.filters[parentindex].btntext = 'Has Not Done ';
//             $scope.filters[parentindex].name = $scope.hasNotDoneItems[
//                 index].name;
//             $scope.filters[parentindex].op = '';
//             $scope.filters[parentindex].optext = '';
//             $scope.filters[parentindex].val = '';
//             console.log($scope.filters);



//             $scope.hasDoneOrHasNotDone = true;
//             $scope.textHasDoneNotHasDone = $scope.hasDoneItems[index].name;
//             $scope.hasDoneOrHasNotDoneClicked = true;
//             $scope.hasCountOfClicked = false;
//             $scope.selectFilterHasOrHasNotDone = 'Has not done';
//             console.log("index: ", index);
//         }



//         $scope.changeFilterCountOf = function (parentindex, index, evt) {
//             $scope.method = 'count';
//             $scope.filters[parentindex].checkMethod = true;
//             console.log("count: ", parentindex);
//             $scope.filters[parentindex].method = 'count';
//             $scope.filters[parentindex].btntext = 'Count Of ' + $scope.countOfItems[
//                 index].name;




//             $scope.hasDoneOrHasNotDone = false;
//             $scope.hasCountOfClicked = true;
//             $scope.hasDoneOrHasNotDoneClicked = false;
//             console.log("index: ", index);
//         }

//         $scope.isActive = function (viewLocation) {
//             return viewLocation === $location.path();
//         };


//         var segments = segment.get.all();
//         $scope.dropdown = [];
//         for (var i = segments.length - 1; i >= 0; i--) {
//             $scope.dropdown.push({
//                 text: segments[i].name
//             });
//         };


//         $scope.segments = segment.get.all();
//         $scope.segmenticons = [];
//         $scope.selectedIcon = $scope.segments[0].name;

//         for (var i = $scope.segments.length - 1; i >= 0; i--) {
//             $scope.segmenticons.push({
//                 value: $scope.segments[i].name,
//                 label: $scope.segments[i].name
//             })
//         };


//         $scope.queries = queryMatching.get.all();
//         $scope.query = [];
//         $scope.queryDisplayed = $scope.queries[0].name;
//         $scope.selectedQuery = queryMatching.get.selected();
//         $scope.selectedqueries = [];
//         for (var i = 0; i <= $scope.queries.length - 1; i++) {
//             $scope.selectedqueries.push({
//                 value: $scope.queries[i].name,
//                 label: $scope.queries[i].name
//             })
//         };


//         $scope.chngquery = function (parentindex, index) {
//             console.log("parentindex: ", parentindex);
//             $scope.filters[parentindex].optext = $scope.queries[index].name;
//             $scope.filters[parentindex].op = $scope.queries[index].key;
//             console.log($scope.filters[parentindex].op);
//             console.log($scope.filters);
//         }

//         $scope.runQuery = function () {
//             console.log("run Query: ", $scope.filters);
//         }

//         console.log("queryDisplayed: ", $scope.queryDisplayed);

//         $scope.text = 'AND';
//         $scope.segmentFilterCtrl = segment.get.selected();
//         $scope.queryFilterCtrl = queryMatching.get.selected();
//         $scope.filters = [];
//         $scope.addAnotherFilter = function addAnotherFilter() {
//             $scope.checkMethod = true;
//             $scope.filters.push({
//                 method: 'count',
//                 btntext: 'Choose',
//                 checkMethod: 'true',
//                 name: '',
//                 op: 'eq',
//                 optext: 'equal',
//                 val: ''
//             })
//         }

//         $scope.removeFilter = function removeFilter(
//             filterToRemove) {
//             var index = $scope.filters.indexOf(
//                 filterToRemove);
//             $scope.filters.splice(index, 1);
//         }
//         $scope.switchAndOr = function switchAndOr() {
//             if ($scope.text === 'AND') {
//                 $scope.text = 'OR'
//             } else {
//                 $scope.text = 'AND'
//             }
//         }

//         $scope.showErr = false;
//         $scope.errMsg = 'Enter the outlined fields';
//         $scope.errorclass = '';

//         $scope.hideErrorAlert = function () {
//             $scope.showErr = false;
//         }

//         $scope.isErr = 'error';

//         $scope.signupForm = function () {
//             console.log($scope.filters);
//             for (var i = 0; i < $scope.filters.length; i++) {
//                 console.log("val: ", $scope.filters[i].val);
//                 if ($scope.filters[i].val == '' && $scope.filters[i].method ==
//                     'count') {
//                     console.log("val: ", $scope.filters[i].val);
//                     $scope.showErr = true;
//                     // $scope.isErr = 'error';
//                     // console.log("error class", $scope.isErr);
//                 } else {
//                     $scope.showErr = false;
//                     // $scope.isErr = '';
//                 }
//             };
//         }
//     }
// ])

.controller('UserListCtrl', ['$scope', '$location', 'segment',
  'queryMatching', '$filter', 'countOfActions', 'hasNotDone',
  'hasDoneActions', 'ngTableParams', 'login', 'modelsQuery',
  'AppService', 'segment', 'queryMatching', 'eventNames',
  'userAttributes', 'lodash', '$modal',
  'UidService', '$moment', 'UserList', '$timeout', 'modelsSegment',
  'segmentService', 'CurrentAppService', 'UserModel', '$log',
  'MsgService', '$stateParams', '$rootScope',
  function ($scope, $location, segment, queryMatching, $filter,
    countOfActions, hasNotDone, hasDoneActions,
    ngTableParams, login, modelsQuery, AppService, segment,
    queryMatching, eventNames, userAttributes, lodash, $modal,
    UidService, $moment, UserList, $timeout, modelsSegment,
    segmentService, CurrentAppService, UserModel, $log, MsgService,
    $stateParams, $rootScope) {

    CurrentAppService.getCurrentApp()
      .then(function (currentApp) {
        console.log("Promise Resolved: ", currentApp);
        console.log("current App from service -->: ",
          AppService.getCurrentApp());
        var currentAppId = $stateParams.id;
        console.log("currentAppId--> ", currentAppId);
        if (currentAppId == null) {
          currentAppId = currentApp[0]._id;
        }
        $scope.showSaveButton = false;
        $scope.showUpdateButton = false;
        $scope.segmentClicked = false;
        $scope.segmentsCreatedName = [];
        $scope.showUpdatePopover = false;
        $scope.showSpinner = false;
        $scope.showAutoMsgBtn = false;
        $scope.firstFilterShowQuery = false;
        $scope.currApp = $stateParams.id;
        var checkSegments = function (err) {
          if (err) {
            return err;
          }
          console.log("segment: ", segmentService.getSegments());
          if (segmentService.getSegments()
            .length > 0) {
            for (var i = 0; i < segmentService.getSegments()
              .length; i++) {
              if (segmentService.getSegments()[i].name == 'Good Health' ||
                segmentService.getSegments()[i].name == 'Average Health' ||
                segmentService.getSegments()[i].name == 'Poor Health') {
                $scope.segmentsCreatedName.push({
                  predefined: true,
                  id: segmentService.getSegments()[i]
                    ._id,
                  name: segmentService.getSegments()[
                    i].name
                })
              } else {
                $scope.segmentsCreatedName.push({
                  predefined: false,
                  id: segmentService.getSegments()[i]
                    ._id,
                  name: segmentService.getSegments()[
                    i].name
                })
              }
            };
            $scope.segmentsCreated = true;
            console.log("$scope.segmentName: ", $scope.segmentsCreatedName);
          } else {
            $scope.segmentsCreated = false;
          }
        }

        modelsSegment.getAllSegments(currentAppId,
          checkSegments);




        var _ = lodash;

        var stringify = function (obj, prefix) {
          if (_.isArray(obj)) {
            return stringifyArray(obj, prefix);
          } else if ('[object Object]' == Object.prototype.toString
            .call(
              obj)) {
            return stringifyObject(obj, prefix);
          } else if ('string' == typeof obj) {
            return stringifyString(obj, prefix);
          } else {
            return prefix + '=' + encodeURIComponent(
              String(obj));
          }
        };

        /**
         * Stringify the given `str`.
         *
         * @param {String} str
         * @param {String} prefix
         * @return {String}
         * @api private
         */

        function stringifyString(str, prefix) {
          if (!prefix) throw new TypeError(
            'stringify expects an object');
          return prefix + '=' + encodeURIComponent(str);
        }

        /**
         * Stringify the given `arr`.
         *
         * @param {Array} arr
         * @param {String} prefix
         * @return {String}
         * @api private
         */

        function stringifyArray(arr, prefix) {
          var ret = [];
          if (!prefix) throw new TypeError(
            'stringify expects an object');
          for (var i = 0; i < arr.length; i++) {
            ret.push(stringify(arr[i], prefix + '[' + i +
              ']'));
          }
          return ret.join('&');
        }

        /**
         * Stringify the given `obj`.
         *
         * @param {Object} obj
         * @param {String} prefix
         * @return {String}
         * @api private
         */

        function stringifyObject(obj, prefix) {
          var ret = [],
            keys = _.keys(obj),
            key;

          for (var i = 0, len = keys.length; i < len; ++i) {
            key = keys[i];
            if ('' == key) continue;
            if (null == obj[key]) {
              ret.push(encodeURIComponent(key) + '=');
            } else {
              ret.push(stringify(obj[key], prefix ?
                prefix + '[' +
                encodeURIComponent(
                  key) + ']' :
                encodeURIComponent(key)));
            }
          }

          return ret.join('&');
        }

        var allActions = [];

        var attributes = [];

        var fillData = function (err) {

          if (err) {
            return;
          }

          for (var i = 0; i < eventNames.getEvents()
            .length; i++) {
            allActions.push({
              name: eventNames.getEvents()[i].name,
              type: eventNames.getEvents()[i].type
            })
          };

          for (var i = 0; i < userAttributes.getUserAttributes()
            .length; i++) {
            attributes.push({
              name: userAttributes.getUserAttributes()[
                i]
            })
          };



          console.log("allActions: ", allActions)


          console.log("inside UserListCtrl loginProvider: ",
            login.getLoggedIn());
          $scope.state = 'form-control';
          $scope.isErr = '';
          $scope.method = 'count';
          $scope.checkMethod = true;
          $scope.rootOperator = 'and';


          $scope.selectFilter = 'Users';
          $scope.hasNotDoneItems = [];
          $scope.hasNotDoneItems = allActions;
          $scope.hasDoneItems = [];
          $scope.hasDoneItems = allActions;
          $scope.countOfItems = [];
          $scope.countOfItems = allActions;
          $scope.hasDoneOrHasNotDoneClicked = false;
          $scope.hasCountOfClicked = true;

          $scope.attributes = [];
          $scope.attributes = attributes;

          $scope.timeSpan = [{
            name: 'at any time',
            value: ''
          }, {
            name: 'within a day',
            value: 1
          }, {
            name: 'within 3 days',
            value: 3
          }, {
            name: 'within a week',
            value: 7
          }, {
            name: 'within a month',
            value: 30
          }]

          $scope.otherTimeRange = 'at any time';

          $scope.scoreQueries = [{
            name: 'equal',
            key: 'eq'
          }, {
            name: 'greater than',
            key: 'gt'
          }, {
            name: 'less than',
            key: 'lt'
          }];

          $scope.healthStatusValuesname = [{
            name: 'Good',
            key: 'good'
          }, {
            name: 'Average',
            key: 'average'
          }, {
            name: 'Poor',
            key: 'poor'
          }];

          $scope.payingStatusValues = [{
            name: 'Free',
            key: 'free'
          }, {
            name: 'Trial',
            key: 'trial'
          }, {
            name: 'Paying',
            key: 'paying'
          }, {
            name: 'Cancelled',
            key: 'cancelled'
          }]

          $scope.changeFilterAttribute = function (
            parentindex, index,
            evt) {

            if ($scope.attributes[index].name == 'joined' || $scope.attributes[
              index].name == 'lastSeen') {
              $scope.filters[parentindex].showPayingStatus = false;
              $scope.filters[parentindex].showHealthStatus = false;
              $scope.filters[parentindex].showDatePicker = true;
              $scope.filters[parentindex].showScore = false;
              $scope.filters[parentindex].showOtherAttributesQuery = false;
              console.log("inside joined attribute: ", $scope.showDatePicker);

              $scope.filters[parentindex].checkMethod = true;
              $scope.filters[parentindex].isEvent = false;
              $scope.filters[parentindex].btntext = $scope.attributes[
                index].name;
              $scope.filters[parentindex].method = 'attr';
              $scope.filters[parentindex].name = $scope.attributes[
                index].name;
              $scope.filters[parentindex].type = '';
              $scope.filters[parentindex].timeRange = '';
              $scope.otherTimeRange = '';
              $scope.filters[parentindex].optext = 'less than';
              $scope.filters[parentindex].val = $moment(new Date())
                .unix() * 1000;
              $scope.filters[parentindex].op = 'lt';
              console.log("$scope.filters error attributes: ", $scope.filters);
            } else if ($scope.attributes[index].name == 'score') {
              $scope.filters[parentindex].showHealthStatus = false;
              $scope.filters[parentindex].showPayingStatus = false;
              $scope.filters[parentindex].showScore = true;
              $scope.filters[parentindex].showDatePicker = false;
              $scope.filters[parentindex].showOtherAttributesQuery = false;
              $scope.filters[parentindex].checkMethod = true;
              $scope.filters[parentindex].isEvent = false;
              $scope.filters[parentindex].btntext = $scope.attributes[
                index].name;
              $scope.filters[parentindex].method = 'attr';
              $scope.filters[parentindex].name = $scope.attributes[
                index].name;
              $scope.filters[parentindex].type = '';
              $scope.filters[parentindex].timeRange = '';
              $scope.otherTimeRange = '';
              $scope.filters[parentindex].optext = 'equal';
              $scope.filters[parentindex].val = '';
            } else if ($scope.attributes[index].name == 'status') {
              $scope.filters[parentindex].showHealthStatus = false;
              $scope.filters[parentindex].showPayingStatus = true;
              $scope.filters[parentindex].showScore = false;
              $scope.filters[parentindex].showDatePicker = false;
              $scope.filters[parentindex].showOtherAttributesQuery = false;
              $scope.filters[parentindex].checkMethod = true;
              $scope.filters[parentindex].isEvent = false;
              $scope.filters[parentindex].btntext = $scope.attributes[
                index].name;
              $scope.filters[parentindex].method = 'attr';
              $scope.filters[parentindex].name = $scope.attributes[
                index].name;
              $scope.filters[parentindex].type = '';
              $scope.filters[parentindex].timeRange = '';
              $scope.otherTimeRange = '';
              $scope.filters[parentindex].optext = 'equal';
              $scope.filters[parentindex].val = 'free';
              $scope.filters[parentindex].valuetext = 'Free';

            } else if ($scope.attributes[index].name == 'health') {
              $scope.filters[parentindex].showHealthStatus = true;
              $scope.filters[parentindex].showPayingStatus = false;
              $scope.filters[parentindex].showScore = false;
              $scope.filters[parentindex].showDatePicker = false;
              $scope.filters[parentindex].showOtherAttributesQuery = false;
              $scope.filters[parentindex].checkMethod = true;
              $scope.filters[parentindex].isEvent = false;
              $scope.filters[parentindex].btntext = $scope.attributes[
                index].name;
              $scope.filters[parentindex].method = 'attr';
              $scope.filters[parentindex].name = $scope.attributes[
                index].name;
              $scope.filters[parentindex].type = '';
              $scope.filters[parentindex].timeRange = '';
              $scope.otherTimeRange = '';
              $scope.filters[parentindex].optext = 'equal';
              $scope.filters[parentindex].val = 'poor';
              $scope.filters[parentindex].valuetext = 'Poor';
            } else {
              $scope.filters[parentindex].showOtherAttributesQuery = true;
              $scope.filters[parentindex].showPayingStatus = false;
              $scope.filters[parentindex].showDatePicker = false;
              $scope.filters[parentindex].showHealthStatus = false;
              $scope.filters[parentindex].showScore = false;
              $scope.filters[parentindex].checkMethod = true;
              $scope.filters[parentindex].isEvent = false;
              $scope.filters[parentindex].btntext = $scope.attributes[
                index].name;
              $scope.filters[parentindex].method = 'attr';
              $scope.filters[parentindex].name = $scope.attributes[
                index].name;
              $scope.filters[parentindex].type = '';
              $scope.filters[parentindex].timeRange = '';
              $scope.otherTimeRange = '';
              $scope.filters[parentindex].optext = 'contains';
              $scope.filters[parentindex].op = 'contains';
              $scope.filters[parentindex].val = '';
            }
          }

          $scope.changeFilterHasDone = function (parentindex,
            index, evt) {
            $scope.filters[parentindex].showHealthStatus = false;
            $scope.filters[parentindex].showPayingStatus = false;
            $scope.filters[parentindex].showScore = false;
            $scope.filters[parentindex].showDatePicker = false;
            $scope.filters[parentindex].showOtherAttributesQuery = false
            $scope.method = 'hasdone';
            $scope.filters[parentindex].checkMethod =
              false;
            $scope.filters[parentindex].isEvent = true;
            console.log("has done: ", parentindex);
            $scope.filters[parentindex].btntext =
              'Has Done';
            $scope.filters[parentindex].method = 'hasdone';
            $scope.filters[parentindex].name = $scope.hasDoneItems[
              index].name;
            $scope.filters[parentindex].op = '';
            $scope.filters[parentindex].optext = '';
            $scope.filters[parentindex].val = '';
            $scope.filters[parentindex].type = $scope.hasDoneItems[
              index].type;
            $scope.filters[parentindex].timeRange = $scope.otherTimeRange;
            $scope.filters[parentindex].val = '';
          }

          $scope.changeFilterHasNotDone = function (
            parentindex, index,
            evt) {
            $scope.filters[parentindex].showHealthStatus = false;
            $scope.filters[parentindex].showPayingStatus = false;
            $scope.filters[parentindex].showScore = false;
            $scope.filters[parentindex].showDatePicker = false;
            $scope.filters[parentindex].showOtherAttributesQuery = false
            $scope.method = 'hasnotdone';
            $scope.filters[parentindex].checkMethod =
              false;
            $scope.filters[parentindex].isEvent = true;
            console.log("has not done: ", parentindex);
            $scope.filters[parentindex].method =
              'hasnotdone';
            $scope.filters[parentindex].btntext =
              'Has Not Done ';
            $scope.filters[parentindex].name = $scope.hasNotDoneItems[
              index].name;
            $scope.filters[parentindex].op = '';
            $scope.filters[parentindex].optext = '';
            $scope.filters[parentindex].val = '';
            $scope.filters[parentindex].type = $scope.hasNotDoneItems[
              index].type;
            $scope.filters[parentindex].timeRange = $scope.otherTimeRange;
            $scope.filters[parentindex].val = '';
            console.log($scope.filters);
          }



          $scope.changeFilterCountOf = function (parentindex,
            index, evt) {
            $scope.filters[parentindex].showHealthStatus = false;
            $scope.filters[parentindex].showPayingStatus = false;
            $scope.filters[parentindex].showScore = false;
            $scope.filters[parentindex].showDatePicker = false;
            $scope.filters[parentindex].showOtherAttributesQuery = false
            $scope.method = 'count';
            $scope.filters[parentindex].checkMethod = true;
            $scope.filters[parentindex].isEvent = true;
            console.log("count: ", parentindex);
            $scope.filters[parentindex].method = 'count';
            $scope.filters[parentindex].btntext =
              'Count Of ' + $scope
              .countOfItems[
                index].name;
            $scope.filters[parentindex].name = $scope
              .countOfItems[
                index].name;
            $scope.filters[parentindex].type = $scope.countOfItems[
              index].type;
            $scope.filters[parentindex].timeRange = $scope.otherTimeRange;
            $scope.filters[parentindex].optext = 'equal';
            $scope.filters[parentindex].op = 'eq';
            $scope.filters[parentindex].val = '';
          }

          var segments = segment.get.all();
          $scope.dropdown = [];
          for (var i = segments.length - 1; i >= 0; i--) {
            $scope.dropdown.push({
              text: segments[i].name
            });
          };


          $scope.segments = segment.get.all();
          $scope.segmenticons = [];
          $scope.selectedIcon = $scope.segments[0].name;

          for (var i = $scope.segments.length - 1; i >= 0; i--) {
            $scope.segmenticons.push({
              value: $scope.segments[i].name,
              label: $scope.segments[i].name
            })
          };

          // $scope.opened = true;

          $scope.openDatePicker = function ($event) {
            console.log("opening datepicker: ", $scope.opened);
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
            console.log("is datepicker opened: ", $scope.opened);
          };


          $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
          };

          $scope.maxDate = new Date();

          // $scope.initDate = new Date('2016-15-20');
          $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy',
            'shortDate'
          ];
          $scope.format = $scope.formats[0];


          $scope.queries = queryMatching.get.all();
          $scope.query = [];
          $scope.queryDisplayed = $scope.queries[0].name;
          $scope.selectedQuery = queryMatching.get.selected();
          $scope.selectedqueries = [];
          for (var i = 0; i <= $scope.queries.length - 1; i++) {
            $scope.selectedqueries.push({
              value: $scope.queries[i].name,
              label: $scope.queries[i].name
            })
          };

          $scope.datePickerQueries = [{
            name: 'less than',
            key: 'lt'
          }, {
            name: 'greater than',
            key: 'gt'
          }]

          $scope.otherAttributesQuery = [{
            name: 'contains',
            key: 'contains'
          }, {
            name: 'equal',
            key: 'eq'
          }]

          $scope.chngHealthStatus = function (parentindex, index) {
            $scope.filters[parentindex].val = $scope.healthStatusValuesname[
              index].key;
            $scope.filters[parentindex].valuetext = $scope.healthStatusValuesname[
              index].name;
          }

          $scope.chngPayingStatus = function (parentindex, index) {
            $scope.filters[parentindex].val = $scope.payingStatusValues[
              index].key;
            $scope.filters[parentindex].valuetext = $scope.payingStatusValues[
              index].name;
          }

          $scope.chngquery = function (parentindex, index) {
            console.log("parentindex: ", parentindex);
            $scope.filters[parentindex].optext = $scope.queries[
              index]
              .name;
            $scope.filters[parentindex].op = $scope.queries[
              index].key;
            console.log($scope.filters[parentindex].op);
            console.log($scope.filters);
          }

          $scope.chngScoreQuery = function (parentindex, index) {
            $scope.filters[parentindex].optext = $scope.scoreQueries[
              index]
              .name;
            $scope.filters[parentindex].op = $scope.scoreQueries[
              index].key;
          }

          $scope.changeOtherAttributesQuery = function (parentindex, index) {
            $scope.filters[parentindex].optext = $scope.otherAttributesQuery[
              index]
              .name;
            $scope.filters[parentindex].op = $scope.otherAttributesQuery[
              index].key;
          }

          $scope.chngDatePickerQuery = function (parentindex, index) {
            $scope.filters[parentindex].optext = $scope.datePickerQueries[
              index]
              .name;
            $scope.filters[parentindex].op = $scope.datePickerQueries[
              index].key;
            console.log("DatePickerQuery: ", $scope.filters);
          }

          $scope.chngrange = function (parentindex, index) {
            $scope.filters[0].timeRange = $scope.timeSpan[index]
              .name;
            $scope.otherTimeRange = $scope.filters[0].timeRange;
            $scope.filters[0].timeRangeValue = $scope.timeSpan[index].value;
          }


          console.log("queryDisplayed: ", $scope.queryDisplayed);

          $scope.text = 'AND';
          $scope.segmentFilterCtrl = segment.get.selected();
          $scope.queryFilterCtrl = queryMatching.get.selected();
          $scope.filters = [];

          $scope.addAnotherFilter = function addAnotherFilter() {
            $scope.checkMethod = true;
            $scope.filters.push({
              method: 'count',
              btntext: 'Choose',
              checkMethod: true,
              isEvent: false,
              days: '',
              name: '',
              op: 'eq',
              optext: 'equal',
              val: '',
              type: '',
              showHealthStatus: false,
              showPayingStatus: false,
              showScore: false,
              showDatePicker: false,
              showOtherAttributesQuery: false
            });
            console.log("$scope.filters[0]: ", $scope.filters[0]);
            if ($scope.filters.length > 0) {
              console.log("getting inside filters length > 0");
              for (var i = 1; i < $scope.filters.length; i++) {
                $scope.filters[i].timeRange = $scope.filters[0].timeRange;
                $scope.filters[i].timeRangeValue = $scope.filters[0].timeRangeValue;
              };
              console.log("$scope.filters[i]: ", $scope.filters);
            } else {
              $scope.filters[0].timeRange = 'at any time';
              $scope.filters[0].timeRangeValue = '';
            }
            if ($scope.filters.length > 0 && $scope.segmentClicked ==
              false) {
              $scope.showSaveButton = true;
              $scope.showUpdateButton = false;
            }

            if ($scope.segmentClicked == true) {
              $scope.showSaveButton = false;
              $scope.showUpdateButton = true;
            }

            // if($scope.segmentClicked == true && $scope.isHealth == true) {
            //   $scope.showSaveButton = false;
            //   $scope.showUpdateButton = false;
            // }
            console.log("$scope.filters: ", $scope.filters);
          }

          $scope.removeFilter = function removeFilter(
            filterToRemove) {
            var index = $scope.filters.indexOf(
              filterToRemove);
            $scope.filters.splice(index, 1);
            // if ($scope.filters.length < $scope.segmentLength &&
            //     $scope.segmentClicked == true) {
            //     $scope.showUpdateButton = true;
            // }

            if ($scope.filters.length == 0) {
              $scope.showSaveButton = false;
              $scope.showUpdateButton = false;
              $scope.segmentClicked = false;
              $scope.showUpdatePopover = false;
              $scope.showPopover = false;
              $scope.showUsers = false;
            }
          }

          $scope.switchAndOr = function switchAndOr() {
            if ($scope.text === 'AND') {
              $scope.text = 'OR'
            } else {
              $scope.text = 'AND'
            }
          }

          var populateTable = function () {
            $scope.showSpinner = false;

            if (err) {
              return err;
            }
            $scope.countUsers = UserList.getUsers()
              .length;
            $scope.users = [];
            if (UserList.getUsers()
              .length > 0) {
              $scope.showUsers = true;
            }
            for (var i = 0; i < UserList.getUsers()
              .length; i++) {
              $scope.users.push({
                id: UserList.getUsers()[i]._id,
                email: UserList.getUsers()[i].email,
                userkarma: UserList.getUsers()[i].score,
                datejoined: moment(UserList.getUsers()[
                  i].firstSessionAt)
                  .format("MMMM Do YYYY"),
                health: UserList.getUsers()[i].health,
                lastsession: moment(UserList.getUsers()[i].lastSeen)
                  .format("MMMM Do YYYY"),
                unsubscribed: UserList.getUsers()[
                  i].unsubscribed
              })
            };

            $scope.columns = [{
              title: '',
              field: 'checkbox',
              visible: true
            }, {
              title: 'Email',
              field: 'email',
              visible: true
            }, {
              title: 'Engagement Score',
              field: 'userkarma',
              visible: true
            }, {
              title: 'Date Joined',
              field: 'datejoined',
              visible: true
            }, {
              title: 'Health',
              field: 'health',
              visible: true
            }, {
              title: 'Last Session',
              field: 'lastsession',
              visible: true
            }, {
              title: 'Unsubscribed',
              field: 'unsubscribed',
              visible: true
            }];

            /**
             * Reference: http://plnkr.co/edit/dtlKAHwy99jdnWVU0pc8?p=preview
             *
             */

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

              $scope.tableParams = new ngTableParams({
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
                total: $scope.users.length, // length of data
                getData: function ($defer, params) {
                  var orderedData = params.sorting() ?
                    $filter('orderBy')($scope.users,
                      params.orderBy()) :
                    $scope.users;
                  params.total(orderedData.length);
                  $defer.resolve(orderedData.slice(
                    (params.page() -
                      1) * params.count(),
                    params.page() *
                    params.count()));
                }
              });
            }
          }


          $scope.queryObj = {};

          $scope.showErrorOnInput = true;
          $scope.runQuery = function () {
            $scope.showSpinner = true;
            $scope.showErrorOnInput = true;
            for (var i = 0; i < $scope.filters.length; i++) {
              console.log("val: ", $scope.filters[i].val);
              if ($scope.filters[i].val == '' && ($scope
                .filters[i].method ==
                'count' || $scope.filters[i].method ==
                'attr')) {
                console.log("val: ", $scope.filters[i]
                  .val);
                $scope.showErrorOnInput = true;
                $rootScope.error = true;
                $rootScope.errMsgRootScope =
                  'Provide a value in segment filter';
                $scope.showErr = true;
                $scope.showSpinner = false;
                $timeout(function () {
                  $rootScope.error = false;
                }, 5000);
                return;
                // $scope.isErr = 'error';
                // console.log("error class", $scope.isErr);
              } else {
                $scope.showErr = false;
                // $scope.isErr = '';
              }
            };
            if ($scope.filters.length > 0) {
              $scope.fromTime = $scope.filters[0].timeRangeValue;
            } else {
              $scope.fromTime = '';
            }
            $scope.filtersBackend = [];
            console.log("run Query: ", $scope.filters);
            for (var i = 0; i < $scope.filters.length; i++) {
              $scope.filtersBackend.push({
                method: $scope.filters[i].method,
                type: $scope.filters[i].type,
                name: $scope.filters[i].name,
                op: $scope.filters[i].op,
                val: $scope.filters[i].val,
                type: $scope.filters[i].type,
              })
            };

            $scope.queryObj.list = $scope.selectedIcon.toLowerCase();
            $scope.queryObj.op = $scope.text.toLowerCase();
            $scope.queryObj.filters = $scope.filtersBackend;
            $scope.queryObj.fromAgo = $scope.fromTime;

            var stringifiedQuery = stringify($scope.queryObj);
            console.log('queryObj', $scope.queryObj);
            console.log('stringifiedQuery',
              stringifiedQuery);


            modelsQuery.runQueryAndGetUsers(currentAppId,
              stringifiedQuery, populateTable);

          }

          $scope.saveQuery = function () {
            for (var i = 0; i < $scope.filters.length; i++) {
              console.log("val: ", $scope.filters[i].val);
              if ($scope.filters[i].val == '' && ($scope
                .filters[i].method ==
                'count' || $scope.filters[i].method ==
                'attr')) {
                console.log("val: ", $scope.filters[i]
                  .val);
                $rootScope.error = true;
                $rootScope.errMsgRootScope =
                  'Provide a value in segment filter';
                $scope.showErr = true;
                $timeout(function () {
                  $rootScope.error = false;
                }, 5000);
                return;
                // $scope.isErr = 'error';
                // console.log("error class", $scope.isErr);
              } else {
                $scope.showErr = false;
                // $scope.isErr = '';
              }
            };
            $scope.showPopover = !$scope.showPopover;
          }

          $scope.closePopover = function (event) {
            event.preventDefault();
            $scope.showPopover = false;
          }

          $scope.closeUpdatePopover = function (event) {
            event.preventDefault();
            $scope.showUpdatePopover = false;
          }

          $scope.updateQuery = function () {
            $scope.showUpdatePopover = !$scope.showUpdatePopover;
          }

          var populateUpdatedSegment = function (err, data) {
            if (err) {
              console.log(
                "error in updating segment name");
              return err;
            }
            console.log("updated segment: ", data);
            $scope.segmentsCreatedName[$scope.selectedIndex]
              .id = data._id;
            $scope.segmentsCreatedName[$scope.selectedIndex]
              .name = data.name;

          }

          $scope.updateSegment = function () {
            $scope.updateSegmentObj = {};
            $scope.filtersBackend = [];
            console.log("update segment: ", $scope.filters);
            for (var i = 0; i < $scope.filters.length; i++) {
              $scope.filtersBackend.push({
                method: $scope.filters[i].method,
                type: $scope.filters[i].type,
                name: $scope.filters[i].name,
                op: $scope.filters[i].op,
                val: $scope.filters[i].val

              })
            };
            $scope.updateSegmentObj.list = $scope.selectedIcon
              .toLowerCase();
            $scope.updateSegmentObj.name = $scope.updatedSegmentName;
            $scope.updateSegmentObj.op = $scope.text.toLowerCase();
            $scope.updateSegmentObj.filters = $scope.filtersBackend;
            $scope.updateSegmentObj.fromAgo = $scope.filters[0].timeRangeValue;
            console.log("updateSegmentObj: ", $scope.updateSegmentObj);

            modelsSegment.updateSegmentModels(currentAppId,
              segmentService.getSegmentId(), $scope.updateSegmentObj,
              populateUpdatedSegment);
            $scope.showUpdatePopover = false;
          }

          var populateNewSegment = function (err, data) {
            if (err) {
              return err;
            }
            $scope.showPopover = false;
            $scope.segmentsCreatedName.push({
              id: data._id,
              name: data.name
            })
          }

          $scope.createSegmentObj = {};
          $scope.createSegment = function () {
            $scope.filtersBackend = [];
            console.log("create segment: ", $scope.filters);
            for (var i = 0; i < $scope.filters.length; i++) {
              $scope.filtersBackend.push({
                method: $scope.filters[i].method,
                type: $scope.filters[i].type,
                name: $scope.filters[i].name,
                op: $scope.filters[i].op,
                val: $scope.filters[i].val

              })
            };
            $scope.createSegmentObj.list = $scope.selectedIcon
              .toLowerCase();
            $scope.createSegmentObj.name = $scope.segmentName;
            $scope.createSegmentObj.op = $scope.text.toLowerCase();
            $scope.createSegmentObj.filters = $scope.filtersBackend;
            $scope.createSegmentObj.fromAgo = $scope.filters[0].timeRangeValue;
            console.log("createSegmentObj: ", $scope.createSegmentObj);

            modelsSegment.createSegment(currentAppId,
              $scope.createSegmentObj,
              populateNewSegment);


          }



          var populateFilterAndRunQuery = function () {
            $scope.segmentLength = '';
            $scope.queryObject = {};
            $scope.filtersFrontEnd = [];
            $scope.fromTimeBackend = ''
            var getFilters = [];
            $scope.filters = [];
            console.log("$scope.queries: ", $scope.queries);
            console.log("segment: ", segmentService.getSingleSegment());
            if (segmentService.getSingleSegment()
              .fromAgo) {
              $scope.fromTimeBackend = segmentService.getSingleSegment()
                .fromAgo;
            } else {
              $scope.fromTimeBackend = '';
            }
            console.log("$scope.fromTimeBackend: ", $scope.fromTimeBackend,
              $scope.timeSpan.length);
            for (var i = 0; i < $scope.timeSpan.length; i++) {
              console.log("$scope.timeSpan[i]: $scope.fromTimeBackend: ",
                $scope.timeSpan[i].value);
              if ($scope.fromTimeBackend === $scope.timeSpan[i].value) {
                console.log("$scope.fromTimeBackend: ", $scope.timeSpan[i]
                  .value);
                $scope.fromTimeFrontEnd = $scope.timeSpan[i].name;
                $scope.fromTimeFrontEndValue = $scope.timeSpan[i].value;
                break;
              }
            };


            console.log("$scope.fromTimeFrontEnd: ", $scope.fromTimeFrontEnd);
            // if($scope.fromTimeBackend === 1) {
            //   $scope.fromTimeFrontEnd = 'within a day';
            // }

            getFilters = segmentService.getSingleSegment()
              .filters;
            $scope.segmentLength = getFilters.length;
            console.log("getFilters: ", getFilters);
            for (var i = 0; i < getFilters.length; i++) {
              $scope.filterValueText = '';
              var filterValueText = '';
              for (var j = 0; j < $scope.healthStatusValuesname.length; j++) {
                if (getFilters[i].val === $scope.healthStatusValuesname[i]
                  .key) {
                  $scope.filterValueText = $scope.healthStatusValuesname[i]
                    .name;
                }
                break;
              };
              var buttonText = '';
              var btnName = '';
              var chkMethod = false;
              var operationText = '';
              console.log("op text: ", getFilters[i].op);
              if (getFilters[i].op != '') {
                for (var j = 0; j < $scope.queries.length; j++) {
                  console.log("$scope.queries[j]: ",
                    $scope.queries[
                      j]);
                  if ($scope.queries[j].key ==
                    getFilters[i].op) {
                    operationText = $scope.queries[
                      j].name;
                  }
                };
              }
              if (getFilters[i].method == 'hasdone') {
                showHealthStatus = false;
                showPayingStatus = false;
                showScore = false;
                showDatePicker = false;
                showOtherAttributesQuery = false;
                buttonText = "Has Done";
                btnName = getFilters[i].name;
                chkMethod = false;
                isEvent = true;
                timeRange = $scope.fromTimeFrontEnd;
                timeRangeValue = $scope.fromTimeFrontEndValue;
              }
              if (getFilters[i].method == 'hasnotdone') {
                showHealthStatus = false;
                showPayingStatus = false;
                showScore = false;
                showDatePicker = false;
                showOtherAttributesQuery = false;
                buttonText = "Has not Done";
                btnName = getFilters[i].name;
                chkMethod = false;
                isEvent = true;
                timeRange = $scope.fromTimeFrontEnd;
                timeRangeValue = $scope.fromTimeFrontEndValue;
              }
              if (getFilters[i].method == 'count') {
                showHealthStatus = false;
                showPayingStatus = false;
                showScore = false;
                showDatePicker = false;
                showOtherAttributesQuery = false;
                buttonText = "Count of " + getFilters[
                  i].name;
                btnName = getFilters[i].name;
                chkMethod = true;
                isEvent = true;
                timeRange = $scope.fromTimeFrontEnd;
                timeRangeValue = $scope.fromTimeFrontEndValue;
              }
              if (getFilters[i].method == 'attr') {
                if (getFilters[i].name == 'score') {
                  showHealthStatus = false;
                  showPayingStatus = false;
                  showScore = true;
                  showDatePicker = false;
                  showOtherAttributesQuery = false;
                } else if (getFilters[i].name == 'health') {
                  showHealthStatus = true;
                  showPayingStatus = false;
                  showScore = false;
                  showDatePicker = false;
                  showOtherAttributesQuery = false;
                  filterValueText = $scope.filterValueText;
                } else if (getFilters[i].name == 'status') {
                  showHealthStatus = false;
                  showPayingStatus = true;
                  showScore = false;
                  showDatePicker = false;
                  showOtherAttributesQuery = false;
                } else if (getFilters[i].name == 'joined' || getFilters[i]
                  .name == 'last seen') {
                  showHealthStatus = false;
                  showPayingStatus = false;
                  showScore = false;
                  showDatePicker = true;
                  showOtherAttributesQuery = false;
                } else {
                  showHealthStatus = false;
                  showPayingStatus = false;
                  showScore = false;
                  showDatePicker = false;
                  showOtherAttributesQuery = true;
                }
                buttonText = getFilters[i].name;
                btnName = getFilters[i].name;
                chkMethod = true;
                isEvent = false;
                timeRange = '';
                timeRangeValue = '';
              }
              $scope.filters.push({
                method: getFilters[i].method,
                btntext: buttonText,
                checkMethod: chkMethod,
                name: btnName,
                op: getFilters[i].op,
                optext: operationText,
                val: getFilters[i].val,
                type: getFilters[i].type,
                timeRange: timeRange,
                isEvent: isEvent,
                timeRangeValue: timeRangeValue,
                valuetext: filterValueText,
                showHealthStatus: showHealthStatus,
                showPayingStatus: showPayingStatus,
                showScore: showScore,
                showDatePicker: showDatePicker,
                showOtherAttributesQuery: showOtherAttributesQuery
              })
              // if($scope.segmentClicked && i == 0) {
              //     console.log("$scope.filters: ", $scope.filters);
              //     $scope.firstFilterShowQuery = true;
              // }

            };

            console.log("$scope.filters: ", $scope.filters);
            $scope.otherTimeRange = $scope.filters[0].timeRange;
            $scope.queryObject.list = segmentService.getSingleSegment()
              .list;
            $scope.queryObject.op = segmentService.getSingleSegment()
              .op;
            $scope.text = $scope.queryObject.op.toUpperCase();
            $scope.queryObject.filters = getFilters;
            console.log("queryobject: ", $scope.queryObject);

            var stringifiedQueryObject = stringify($scope.queryObject);
            console.log('queryObj', $scope.queryObject);
            console.log('stringifiedQuery',
              stringifiedQueryObject);

            modelsQuery.runQueryAndGetUsers(currentAppId,
              stringifiedQueryObject,
              populateTable);


          }

          $scope.currentSegment = [];
          $scope.showQuery = function (segId, index, segname) {
            $scope.segmentClicked = true;
            $scope.showUpdateButton = true;
            if (segname.name == 'Good Health' || segname.name ==
              'Average Health' || segname.name == 'Poor Health') {
              // $scope.showUpdateButton = false;
              $scope.isHealth = true;
            } else {
              $scope.isHealth = false;
            }
            this.showAutoMsgBtn = true;
            $scope.selectedIndex = index;
            $scope.showSaveButton = false;
            $scope.updatedSegmentName = segname.name;
            segmentService.setSegmentId(segId);
            $scope.sid = segId;
            console.log("segname: ", segname);
            $scope.currentSegment.id = segname.id;
            $scope.currentSegment.name = segname.name;
            segmentService.setSingleSegment($scope.currentSegment);
            console.log("segmentId: ", segmentService.getSegmentId(),
              segmentService.getSingleSegment());
            modelsSegment.getSegment(currentAppId, segId,
              populateFilterAndRunQuery);
          }

          $scope.showAutoMsgButton = function () {
            this.showAutoMsgBtn = true;
          }

          $scope.hideAutoMsgButton = function () {
            this.showAutoMsgBtn = false;
          }

          // $scope.createAutoMsg = function (segId, index) {
          //     console.log("create AutoMsg clicked");
          // }

          // $scope.showErr = false;
          // $scope.errMsg = 'Enter the outlined fields';
          // $scope.errorclass = '';

          // $scope.hideErrorAlert = function () {
          //     $scope.showErr = false;
          // }

          $scope.isErr = 'error';

          $scope.popoverForm = function () {
            console.log($scope.filters);
            for (var i = 0; i < $scope.filters.length; i++) {
              console.log("val: ", $scope.filters[i].val);
              if ($scope.filters[i].val == '' && $scope.filters[
                  i].method ==
                'count') {
                console.log("val: ", $scope.filters[i]
                  .val);
                $scope.showErr = true;
              } else {
                $scope.showErr = false;
              }
            };
          }

        }

        var showProfile = function (err, data, uid) {
          $location.path('/apps/' + currentAppId +
            '/users/profile/' + uid);
        }

        $scope.showUserProfile = function (id) {
          UserModel.getUserProfile(id, currentAppId,
            showProfile);
        }

        console.log("App Id: ", currentAppId);


        modelsQuery.getQueries(currentAppId, fillData);


        // $scope.title = "Write Message";

        // var popupModal = $modal({
        //     scope: $scope,
        //     template: '/templates/usersmodule/message.modal.html',
        //     show: false
        // });

        $scope.showErr = false;

        $scope.hideMaxMsgErrorAlert = function () {
          $scope.showMaxMsgErr = false;
        }

        // $scope.openModal = function () {
        //     $scope.mail = [];
        //     console.log("items ticked: ", Object.keys($scope.checkboxes
        //             .items)
        //         .length);
        //     if (Object.keys($scope.checkboxes.items)
        //         .length <= 50) {
        //         popupModal.show();
        //     }
        //     console.log("checkboxes items: ", $scope.checkboxes
        //         .items);
        //     var prop, value;
        //     var keys = Object.keys($scope.checkboxes.items);
        //     for (var i = 0; i < Object.keys($scope.checkboxes.items)
        //         .length; i++) {
        //         prop = keys[i];
        //         console.log("id: ", prop);
        //         value = $scope.checkboxes.items[prop];
        //         console.log("value: ", value);
        //         if (value == true) {
        //             $scope.mail.push(prop);
        //         }
        //     };
        //     console.log("email objects: ", $scope.mail);
        //     if ($scope.mail.length > 50) {
        //         $scope.showMaxMsgErr = true;
        //         $scope.maxMsgErr =
        //             "Maximum Messages that can be sent at once is 50";

        //     } else {
        //         UidService.set($scope.mail);
        //     }
        // };


        var data = [];
        $scope.users = [];

        $scope.checkboxes = {
          'checked': false,
          items: {}
        };

        console.log("checkboxes: ", $scope.checkboxes);

        $scope.$watch('checkboxes.all', function (value) {
          angular.forEach($scope.users, function (item) {
            if (angular.isDefined(item.id)) {
              $scope.checkboxes.items[item.id] =
                value;
            }
          });
        });

        $scope.$watch('checkboxes.items', function (value) {
          // if($scope.checkboxes.items.length > 0) {
          //   $scope.mailLength = false;
          // }
          console.log("$watch checkboxes: ", $scope.checkboxes
            .items);
        })


        $scope.openModal = function () {
          $scope.mail = [];
          console.log("items ticked: ", _.keys(
              $scope.checkboxes
              .items)
            .length);
          console.log("checkboxes items: ",
            $scope.checkboxes
            .items);

          console.log("email objects: ", $scope.mail);
          var prop, value;
          var keys = _.keys($scope.checkboxes
            .items);
          for (var i = 0; i < _.keys($scope
              .checkboxes
              .items)
            .length; i++) {
            prop = keys[i];
            console.log("id: ", prop);
            value = $scope.checkboxes.items[
              prop];
            console.log("value: ", value);
            if (value == true) {
              $scope.mail.push(prop);
            }
          };
          UidService.set($scope.mail);


          if ($scope.mail.length > 50) {
            $rootScope.error = true;
            $rootScope.errMsgRootScope =
              'Maximum Messages that can be sent at once is 50';
            $timeout(function () {
              $rootScope.error = false;
            }, 5000);
          } else {

            var modalInstance = $modal.open({
              templateUrl: '/templates/usersmodule/message.modal.html',
              controller: 'sendMessageCtrl',
              size: 'lg'
            });

            modalInstance.opened.then(function () {
              $log.info(
                'message modal template downloaded'
              );
            })

            var populateMsgOnCreation = function (err,
              lastNote) {
              if (err) {
                return;
              }
            }
            modalInstance.result.then(function (mail) {
              var sanitizedMsg = mail.msgtext.replace(/\n/g, '<br/>');

              console.log("subject : ", mail.sub);
              console.log("msgtext: ", mail.msgtext);
              console.log("sanitizedMsg: ", sanitizedMsg);
              console.log("uid : ", UidService.get());
              MsgService.sendManualMessage(mail.sub,
                sanitizedMsg, UidService.get(), currentAppId,
                populateMsgOnCreation);
            }, function () {
              $log.info('Modal dismissed at: ' + new Date());
            });
          }

        };

      })
  }
])



.controller('sendMessageCtrl', ['$scope', 'MsgService', '$modal', 'UidService',
  '$modalInstance',
  function ($scope, MsgService, $modal, UidService, $modalInstance) {
    console.log("inside send message ctrl");
    $scope.mail = {
      sub: '',
      msgtext: ''
    }
    $scope.sendManualMessage = function () {
      $modalInstance.close($scope.mail);
      console.log("sub: ", $scope.mail.sub);
      console.log("send Message Ctrl msg: ", $scope.mail.msgtext);
    }
  }
])

.controller('ProfileCtrl', ['$scope', 'UserModel', 'CurrentAppService',
  'InboxMsgService', '$moment', 'UserList', '$modal', 'NotesService',
  '$location', '$timeout', '$state', '$stateParams', '$rootScope',
  '$log', 'AppService', 'MsgService', '$moment',

  function ($scope, UserModel, CurrentAppService, InboxMsgService,
    $moment, UserList, $modal, NotesService, $location, $timeout,
    $state, $stateParams, $rootScope, $log, AppService, MsgService,
    $moment) {

    var currentAppId = $stateParams.aid;
    $scope.uid = $stateParams.id;
    console.log("currentAppId: ", currentAppId);
    $scope.notes = [];
    $scope.msgs = [];
    $scope.currentApp = {};
    $scope.useremail = null;



    CurrentAppService
      .getCurrentApp()
      .then(function (currentApp) {

        var populatePage = function (err, data, uid) {
          function getRandomColor() {
            console.log("data: ", data);
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
              // console.log("value prop: ", value, prop);
              if (prop != 'companies' && prop != 'ct' && prop != 'meta' &&
                prop != 'ut' && prop != '__v' && prop != 'aid' && prop !=
                '_id') {
                if (prop == 'lastSeen') {
                  prop = 'Last Seen';
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
              'http://www.gravatar.com/avatar/' + MD5(email) +
              '.jpg?d=404');
            return 'http://www.gravatar.com/avatar/' + MD5(email) +
              '.jpg?d=404';
          }

          var gravatar = '';
          var src = '';
          gravatar = get_gravatar(data.email, 80);
          src = 'http://placehold.it/150/' + getRandomColor() +
            '/FFF&text=' +
            data.email.charAt(0);


          $scope.user = {
            _id: uid,
            email: data.email,
            name: data.name,
            profilegravatar: gravatar,
            profilesrc: src,
            lastSession: data.lastSeen
          }

          $scope.userDataList = [];

          for (var i = 0; i < $scope.userdata.length; i++) {
            $scope.userDataList.push({
              value: $scope.userdata[i].value,
              data: $scope.userdata[i].data
            })
          };

          // for (var i = 7; i < $scope.userdata.length; i++) {
          //   $scope.userDataSecondList.push({
          //     value: $scope.userdata[i].value,
          //     data: $scope.userdata[i].data
          //   })
          // };

          $scope.title = "Create Note";
          $scope.country = 'India';
          $scope.os = 'Ubuntu';
          $scope.browser = 'Mozilla Firefox';
          $scope.events = [];
          console.log("$scope.user.lastSeen: ", $scope.user.lastSession);
          $scope.toTime = $moment($scope.user.lastSession)
            .startOf('day')
            .unix();
          $scope.showPreviousBtn = false;

          console.log($moment($scope.user.lastSession)
            .unix() * 1000, $scope.user.lastSession);
          $scope.fromTime = $moment($moment($scope.user.lastSession)
            .unix() * 1000 - 24 *
            60 * 60 *
            1000)
            .startOf('day')
            .unix();

          $scope.toScoreTime = $moment()
            .subtract('days', 1)
            .startOf('day')
            .unix();
          $scope.fromScoreTime = $moment()
            .subtract('days', 29)
            .startOf('day')
            .unix();

          console.log("$scope.fromTime: ", $scope.fromTime,
            $scope.toTime);

          $scope.eventDate = $moment($scope.user.lastSession)
            .format('MMMM Do');
          $scope.lastEventDate = $scope.user.lastSession;
          console.log("$scope.eventDate: ", $scope.eventDate);
          $scope.showEvents = false;



          var populateEvents = function (err, events) {
            $scope.events = [];
            console.log("events: ", events, _.keys(events)
              .length);
            if (err) {
              console.log("error");
              return;
            }
            // TODO: Show recent activity based on last seen data
            if (_.keys(events)
              .length == 0) {
              console.log("events length is zero");
              if ($scope.nextClicked) {
                $scope.lastEventDate = $moment($scope.lastEventDate)
                  .unix() * 1000 -
                  24 * 60 * 60 *
                  1000;
              }
              if ($scope.previousClicked) {
                $scope.lastEventDate = $moment($scope.lastEventDate)
                  .unix() * 1000 +
                  24 * 60 * 60 *
                  1000;
              }

              $scope.eventDate = $moment($scope.lastEventDate)
                .format('MMMM Do');
              console.log(
                "$scope.eventDate when events length is zero: ",
                $scope.eventDate);
              $scope.showEvents = false;

            } else {
              $scope.showEvents = true
              var keys = '';
              keys = _.keys(events);
              console.log("keys: ", keys, keys[0]);
              var value = [];
              value = events[keys];
              if (value != null) {
                $scope.eventDate = $moment(keys[0] *
                  1000)
                  .format('MMMM Do');
                $scope.lastEventDate = keys[0] * 1000;
                for (var i = 0; i < value.length; i++) {
                  // value = events[keys[i]];
                  console.log("value: ", value);
                  $scope.events.push({
                    name: value[i].name,
                    when: $moment(value[i].ct)
                      .fromNow()
                  })
                };
              }
              console.log("$scope.events: ", $scope.events);

            }
          }

          $scope.nextClicked = false;
          $scope.previousClicked = false;

          $scope.showEventPreviousDate = function () {
            $scope.previousClicked = true;
            $scope.nextClicked = false;
            $scope.fromTime = $moment($scope.fromTime *
              1000 +
              24 * 60 *
              60 * 1000)
              .startOf('day')
              .unix();
            $scope.toTime = $moment($scope.toTime *
              1000 +
              24 *
              60 * 60 *
              1000)
              .startOf('day')
              .unix();
            if ($scope.toTime === $moment($scope.user.lastSession)
              .startOf('day')
              .unix()) {
              $scope.showPreviousBtn = false;
            } else {
              $scope.showPreviousBtn = true;
            }
            console.log("new fromTime: ", $scope.fromTime,
              $moment($scope.fromTime *
                1000)
              .format());
            console.log("new toTime: ", $scope.toTime,
              $moment(
                $scope.toTime *
                1000)
              .format());
            UserModel.getEvents(currentAppId, $scope.uid,
              $scope.fromTime,
              $scope.toTime, populateEvents);
          }

          $scope.showEventNextDate = function () {
            // console.log("last session: ", $moment($scope.user.lastSession)
            // .startOf('day')
            // .unix());
            // if($scope.toTime ===  $moment($scope.user.lastSession)
            // .startOf('day')
            // .unix()) {
            //   $scope.showPreviousBtn = false;
            // } else {
            //   $scope.showPreviousBtn = true;
            // }
            $scope.showPreviousBtn = true;
            $scope.nextClicked = true;
            $scope.previousClicked = false;
            console.log("fromTime toTime: ", $scope.fromTime,
              $scope.toTime);
            $scope.fromTime = $moment($scope.fromTime *
              1000 -
              24 * 60 *
              60 * 1000)
              .startOf('day')
              .unix();
            $scope.toTime = $moment($scope.toTime *
              1000 -
              24 *
              60 * 60 *
              1000)
              .startOf('day')
              .unix();
            console.log("new fromTime: ", $scope.fromTime,
              $moment($scope.fromTime *
                1000)
              .format());
            console.log("new toTime: ", $scope.toTime,
              $moment(
                $scope.toTime *
                1000)
              .format());
            UserModel.getEvents(currentAppId, $scope.uid,
              $scope.fromTime,
              $scope.toTime, populateEvents);
          }

          var populateGraph = function (err, data) {
            if (err) {
              console.log('err');
              return;
            }
            var keys = [];
            keys = _.keys(data);
            console.log("keys: ", keys);
            var value = [];
            for (var i = 0; i < keys.length; i++) {
              var val = [];
              val = [Math.floor(keys[i]) * 1000, data[
                keys[i]]];
              value.push(val);
            };
            console.log("value: ", value);

            var color = '#95a5a6';
            var colorCategory = d3.scale.category20b()
            $scope.colorFunction = function () {
              return function (d, i) {
                console.log("color: ", colorCategory(i));
                var color = '#16a085';
                return color;
              };
            }

            $scope.graphData = [{
              "key": "Series 1",
              "values": value
            }]
            console.log("graphdata: ", $scope.graphData);
          }

          UserModel.getEngagementScore(currentAppId,
            $scope.uid,
            $scope.fromScoreTime, $scope.toScoreTime,
            populateGraph);

          UserModel.getEvents(currentAppId, $scope.uid,
            $scope.fromTime,
            $scope.toTime, populateEvents);

          /**
           * Populating the newly created note in the notes table
           */

          $scope.populateNotesOnCreation = function (err,
            lastNote) {

            if (err) {
              return err;
            }

            console.log("lastNote: ", lastNote);

            $scope.notes.unshift({
              text: lastNote.note,
              when: $moment(lastNote.ct)
                .fromNow()
            });
          };

          $scope.populateMsgOnCreation = function (err,
            lastMsg) {
            if (err) {
              return err;
            }
            console.log("lastMsg: ", lastMsg[0]);
            console.log("subject created msg: ",
              lastMsg[0]
              .sub,
              lastMsg[0]
              .sName, lastMsg[0].ct, lastMsg[0].toRead
            );

            $scope.msgs.unshift({
              id: lastMsg[0]._id,
              sub: lastMsg[0].sub,
              when: $moment(lastMsg[0].ct)
                .fromNow(),
              opened: lastMsg[0].toRead,
              replied: false // TODO: get status from backend when ready
            })
          }


          var populateMsgList = function (err) {
            if (err) {
              return err;
            }
            for (var i = 0; i < InboxMsgService.getLatestConversations()
              .length; i++) {
              $scope.msgs.push({
                id: InboxMsgService.getLatestConversations()[
                  i]._id,
                sub: InboxMsgService.getLatestConversations()[
                  i].sub,
                when: $moment(InboxMsgService.getLatestConversations()[
                  i].ct)
                  .fromNow(),
                opened: InboxMsgService.getLatestConversations()[
                  i].toRead,
                replied: false // TODO: get status from backend when ready
              })
            };
          }

          var populateNotes = function (err) {
            if (err) {
              return err;
            }

            var notes = NotesService.getNotes();
            var length = notes.length;
            for (var i = 0; i < length; i++) {
              $scope.notes.push({
                text: notes[i].note,
                when: $moment(notes[i].ct)
                  .fromNow()
              })
            };
          };

          UserModel.getNotes(currentAppId, $scope.uid,
            populateNotes);

          UserModel.getLatestConversations(currentAppId,
            $scope.uid,
            populateMsgList);

          $scope.openMessageModal = function () {

            var modalInstance = $modal.open({
              templateUrl: '/templates/usersmodule/message.modal.id.html',
              controller: 'sendMessageCtrl',
              size: 'lg'
            });

            modalInstance.opened.then(function () {
              $log.info(
                'message modal template downloaded'
              );
            })



            modalInstance.result.then(function (mail) {
              console.log("mail: ", mail)
              console.log("subject : ", mail.sub);
              console.log("msgtext: ", mail.msgtext);
              var emailId = [];
              var sanitizedMsg = mail.msgtext.replace(/\n/g, '<br/>');
              emailId.push($stateParams.id);
              console.log("uid : ", emailId);
              MsgService.sendManualMessage(mail.sub,
                sanitizedMsg, emailId, currentAppId, $scope.populateMsgOnCreation
              );
            }, function () {
              $log.info('Modal dismissed at: ' +
                new Date());
            });
          };


          $scope.openNoteModal = function () {

            var modalInstance = $modal.open({
              templateUrl: '/templates/usersmodule/note.modal.html',
              controller: 'NoteModalCtrl',
              size: 'sm'
            });

            modalInstance.opened.then(function () {
              $log.info(
                'modal template downloaded')
            })

            modalInstance.result.then(function (note) {
              var data = {
                note: note
              };
              UserModel.createNote(currentAppId,
                $scope.user
                ._id,
                data,
                $scope.populateNotesOnCreation
              );

            }, function () {
              $log.info('Modal dismissed at: ' +
                new Date());
            });
          };

          $scope.redirectToConversation = function (id) {
            console.log(
              "redirecting to conversation: ",
              id);
            $location.path('/apps/' + currentAppId +
              '/messages/conversations/' + id);
          };



          $scope.xAxisTickFormatFunction = function () {

            return function (d) {

              return d3.time.format('%x')(new Date(d)); //uncomment for date format

            }

          }

          $scope.toolTipContentFunction = function () {
            return function (key, x, y, e, graph) {
              return '<p>' + y + ' at ' + $moment(x)
                .format('MMMM Do') + '</p>'
            }
          }
        }

        UserModel.getUserProfile($stateParams.id,
          currentAppId,
          populatePage);

        $scope.currentApp = currentAppId;
        $scope.useremail = UserList.getUserEmail();
        /*$scope.user = {

                    }*/




      })

    // $scope.init();




    // TODO: Get data from backend

    $scope.exampleData = [{
      "key": "Series 1",
      "values": [
        [1025409600000, 0],
        [1028088000000, -6.3382185140371],
        [1030766400000, -5.9507873460847],
        [1033358400000, -11.569146943813],
        [1036040400000, -5.4767332317425],
        [1038632400000, 0.50794682203014],
        [1041310800000, -5.5310285460542],
        [1043989200000, -5.7838296963382],
        [1046408400000, -7.3249341615649],
        [1049086800000, -6.7078630712489],
        [1051675200000, 0.44227126150934],
        [1054353600000, 7.2481659343222],
        [1056945600000, 9.2512381306992],
        [1059624000000, 11.341210982529],
        [1062302400000, 14.734820409020],
        [1064894400000, 12.387148007542],
        [1067576400000, 18.436471461827],
        [1070168400000, 19.830742266977],
        [1072846800000, 22.643205829887],
        [1075525200000, 26.743156781239],
        [1078030800000, 29.597478802228],
        [1080709200000, 30.831697585341],
        [1083297600000, 28.054068024708],
        [1085976000000, 29.294079423832],
        [1088568000000, 30.269264061274],
        [1091246400000, 24.934526898906],
        [1093924800000, 24.265982759406],
        [1096516800000, 27.217794897473],
        [1099195200000, 30.802601992077],
        [1101790800000, 36.331003758254],
        [1104469200000, 43.142498700060],
        [1107147600000, 40.558263931958],
        [1109566800000, 42.543622385800],
        [1112245200000, 41.683584710331],
        [1114833600000, 36.375367302328],
        [1117512000000, 40.719688980730],
        [1120104000000, 43.897963036919],
        [1122782400000, 49.797033975368],
        [1125460800000, 47.085993935989],
        [1128052800000, 46.601972859745],
        [1130734800000, 41.567784572762],
        [1133326800000, 47.296923737245],
        [1136005200000, 47.642969612080],
        [1138683600000, 50.781515820954],
        [1141102800000, 52.600229204305],
        [1143781200000, 55.599684490628],
        [1146369600000, 57.920388436633],
        [1149048000000, 53.503593218971],
        [1151640000000, 53.522973979964],
        [1154318400000, 49.846822298548],
        [1156996800000, 54.721341614650],
        [1159588800000, 58.186236223191],
        [1162270800000, 63.908065540997],
        [1164862800000, 69.767285129367],
        [1167541200000, 72.534013373592],
        [1170219600000, 77.991819436573],
        [1172638800000, 78.143584404990],
        [1175313600000, 83.702398665233],
        [1177905600000, 91.140859312418],
        [1180584000000, 98.590960607028],
        [1183176000000, 96.245634754228],
        [1185854400000, 92.326364432615],
        [1188532800000, 97.068765332230],
        [1191124800000, 105.81025556260],
        [1193803200000, 114.38348777791],
        [1196398800000, 103.59604949810],
        [1199077200000, 101.72488429307],
        [1201755600000, 89.840147735028],
        [1204261200000, 86.963597532664],
        [1206936000000, 84.075505208491],
        [1209528000000, 93.170105645831],
        [1212206400000, 103.62838083121],
        [1214798400000, 87.458241365091],
        [1217476800000, 85.808374141319],
        [1220155200000, 93.158054469193],
        [1222747200000, 65.973252382360],
        [1225425600000, 44.580686638224],
        [1228021200000, 36.418977140128],
        [1230699600000, 38.727678144761],
        [1233378000000, 36.692674173387],
        [1235797200000, 30.033022809480],
        [1238472000000, 36.707532162718],
        [1241064000000, 52.191457688389],
        [1243742400000, 56.357883979735],
        [1246334400000, 57.629002180305],
        [1249012800000, 66.650985790166],
        [1251691200000, 70.839243432186],
        [1254283200000, 78.731998491499],
        [1256961600000, 72.375528540349],
        [1259557200000, 81.738387881630],
        [1262235600000, 87.539792394232],
        [1264914000000, 84.320762662273],
        [1267333200000, 90.621278391889],
        [1270008000000, 102.47144881651],
        [1272600000000, 102.79320353429],
        [1275278400000, 90.529736050479],
        [1277870400000, 76.580859994531],
        [1280548800000, 86.548979376972],
        [1283227200000, 81.879653334089],
        [1285819200000, 101.72550015956],
        [1288497600000, 107.97964852260],
        [1291093200000, 106.16240630785],
        [1293771600000, 114.84268599533],
        [1296450000000, 121.60793322282],
        [1298869200000, 133.41437346605],
        [1301544000000, 125.46646042904],
        [1304136000000, 129.76784954301],
        [1306814400000, 128.15798861044],
        [1309406400000, 121.92388706072],
        [1312084800000, 116.70036100870],
        [1314763200000, 88.367701837033],
        [1317355200000, 59.159665765725],
        [1320033600000, 79.793568139753],
        [1322629200000, 75.903834028417],
        [1325307600000, 72.704218209157],
        [1327986000000, 84.936990804097],
        [1330491600000, 93.388148670744]
      ]
    }];

    console.log("exampleData: ", $scope.exampleData);


  }
])

.controller('NoteModalCtrl', ['$scope', '$modalInstance',
  function ($scope, $modalInstance) {

    $scope.note = {
      text: ''
    };
    $scope.createNote = function () {
      $modalInstance.close($scope.note.text);
    };


  }
])

// .controller('notesCtrl', ['$scope', 'UserModel', 'CurrentAppService',
//     function ($scope, UserModel, CurrentAppService) {

//         CurrentAppService.getCurrentApp()
//             .then(function (currentApp) {
//                 var url = window.location.href;
//                 var uid = url.split("/")[5];
//                 $scope.createNote = function () {
//                     var data = {
//                         note: $scope.notetext
//                     };
//                     UserModel.createNote(currentApp._id, uid, data);
//                 }
//             })

//     }
// ])

// .controller('TableCtrl', ['$scope', '$filter', 'ngTableParams', '$modal',
//     'UidService', '$moment', 'UserList', '$timeout',

//     function ($scope, $filter, ngTableParams, $modal, UidService, $moment,
//         UserList, $timeout) {

//         $scope.title = "Write Message";

//         var popupModal = $modal({
//             scope: $scope,
//             template: '/templates/usersmodule/message.modal.html',
//             show: false
//         });

//         $scope.mail = [];
//         $scope.openModal = function () {
//             popupModal.show();
//             console.log("checkboxes items: ", $scope.checkboxes.items);
//             /*Object.keys(obj)
//                 .forEach(function (key) {
//                     f(key, obj[key])
//                 });*/
//             var prop, value;
//             var keys = Object.keys($scope.checkboxes.items);
//             for (var i = 0; i < Object.keys($scope.checkboxes.items)
//                 .length; i++) {
//                 prop = keys[i];
//                 console.log("id: ", prop);
//                 value = $scope.checkboxes.items[prop];
//                 console.log("value: ", value);
//                 if (value) {
//                     $scope.mail[i] = prop;
//                 }
//             };
//             console.log("email objects: ", $scope.mail);
//             UidService.set($scope.mail);

//         };


//         var data = [];
//         $scope.users = []

//         $scope.checkboxes = {
//             'checked': false,
//             items: {}
//         };

//         console.log("checkboxes: ", $scope.checkboxes);

//         $scope.$watch('checkboxes.items', function (value) {
//             console.log("$watch checkboxes: ", $scope.checkboxes.items);
//         })

//         $scope.$watch(UserList.getUsers, function () {
//             if (UserList.getUsers().length > 0) {
//                 $scope.showUsers = true;
//             }
//             for (var i = 0; i < UserList.getUsers()
//                 .length; i++) {
//                 $scope.users.push({
//                     id: UserList.getUsers()[i]._id,
//                     email: UserList.getUsers()[i].email,
//                     userkarma: UserList.getUsers()[i].healthScore,
//                     datejoined: moment(UserList.getUsers()[i].firstSessionAt)
//                         .format("MMMM Do YYYY"),
//                     unsubscribed: UserList.getUsers()[i].unsubscribed
//                 })
//             };

//             $scope.columns = [{
//                 title: '',
//                 field: 'checkbox',
//                 visible: true
//             }, {
//                 title: 'Email',
//                 field: 'email',
//                 visible: true
//             }, {
//                 title: 'User Karma',
//                 field: 'userkarma',
//                 visible: true
//             }, {
//                 title: 'Date Joined',
//                 field: 'datejoined',
//                 visible: true
//             }, {
//                 title: 'Unsubscribed',
//                 field: 'unsubscribed',
//                 visible: true
//             }];

//             /**
//              * Reference: http://plnkr.co/edit/dtlKAHwy99jdnWVU0pc8?p=preview
//              *
//              */

//             $scope.refreshTable = function () {
//                 $scope['tableParams'] = {
//                     reload: function () {},
//                     settings: function () {
//                         return {}
//                     }
//                 };
//                 $timeout(setTable, 100)
//             };
//             $scope.refreshTable();

//             function setTable(arguments) {

//                 $scope.tableParams = new ngTableParams({
//                     page: 1, // show first page
//                     count: 10, // count per page
//                     filter: {
//                         name: '' // initial filter
//                     },
//                     sorting: {
//                         name: 'asc'
//                     }
//                 }, {
//                     filterSwitch: true,
//                     total: $scope.users.length, // length of data
//                     getData: function ($defer, params) {
//                         var orderedData = params.sorting() ?
//                             $filter('orderBy')($scope.users,
//                                 params.orderBy()) :
//                             $scope.users;
//                         params.total(orderedData.length);
//                         $defer.resolve(orderedData.slice((params.page() -
//                                 1) * params.count(), params.page() *
//                             params.count()));
//                     }
//                 });
//             }
//         })




//         // $scope.tabledropdown = {

//         // }

//     }
// ])