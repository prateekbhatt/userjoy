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
            .state('users.list', {
                url: '/list',
                views: {
                    "panel": {
                        templateUrl: '/templates/usersmodule/users.list.html',
                        controller: 'UserListCtrl'
                    },
                    "table": {
                        templateUrl: '/templates/usersmodule/users.list.table.html',
                        controller: 'TableCtrl'
                    }
                },
                authenticate: true

            })
            .state('profile', {
                url: '/users/profile/id',
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

.controller('UserSegmentCtrl', ['$scope', '$location', 'segment',
    'queryMatching', '$filter', 'countOfActions', 'hasNotDone',
    'hasDoneActions', 'ngTableParams',
    function ($scope, $location, segment, queryMatching, $filter,
        countOfActions, hasNotDone, hasDoneActions,
        ngTableParams) {


        $scope.state = 'form-control';
        $scope.isErr = '';
        $scope.method = 'count';
        $scope.checkMethod = true;
        $scope.rootOperator = 'and';
        $scope.newFilterArray = [{
                method: 'hasdone',
                name: 'Create new chat',
                op: '',
                val: ''
            },

            {
                method: 'count',
                name: 'Logged In',
                op: 'gt',
                val: 20
            }
        ]


        $scope.selectFilter = 'Users';
        $scope.hasNotDoneItems = [];
        $scope.hasNotDoneItems = hasNotDone.getAllHasNotDoneActions();
        $scope.hasDoneItems = [];
        $scope.hasDoneItems = hasDoneActions.getAllHasDoneActions();
        $scope.countOfItems = [];
        $scope.countOfItems = countOfActions.getCountOfActions();
        $scope.hasDoneOrHasNotDoneClicked = false;
        $scope.hasCountOfClicked = true;

        $scope.changeFilterHasDone = function (parentindex, index, evt) {
            $scope.method = 'hasdone';
            $scope.filters[parentindex].checkMethod = false;
            console.log("has done: ", parentindex);
            $scope.filters[parentindex].btntext = 'Has Done';
            $scope.filters[parentindex].method = 'hasdone';
            $scope.filters[parentindex].name = $scope.hasDoneItems[index].name;
            $scope.filters[parentindex].op = '';
            $scope.filters[parentindex].optext = '';
            $scope.filters[parentindex].val = '';


            $scope.hasDoneOrHasNotDone = true;
            $scope.textHasDoneNotHasDone = $scope.hasDoneItems[index].name;
            $scope.hasDoneOrHasNotDoneClicked = true;
            $scope.hasCountOfClicked = false;
            $scope.selectFilterHasOrHasNotDone = 'Has done ';
            console.log("index: ", index);
        }

        $scope.changeFilterHasNotDone = function (parentindex, index, evt) {
            $scope.method = 'hasnotdone';
            $scope.filters[parentindex].checkMethod = false;
            console.log("has not done: ", parentindex);
            $scope.filters[parentindex].method = 'hasnotdone';
            $scope.filters[parentindex].btntext = 'Has Not Done ';
            $scope.filters[parentindex].name = $scope.hasNotDoneItems[
                index].name;
            $scope.filters[parentindex].op = '';
            $scope.filters[parentindex].optext = '';
            $scope.filters[parentindex].val = '';
            console.log($scope.filters);



            $scope.hasDoneOrHasNotDone = true;
            $scope.textHasDoneNotHasDone = $scope.hasDoneItems[index].name;
            $scope.hasDoneOrHasNotDoneClicked = true;
            $scope.hasCountOfClicked = false;
            $scope.selectFilterHasOrHasNotDone = 'Has not done';
            console.log("index: ", index);
        }



        $scope.changeFilterCountOf = function (parentindex, index, evt) {
            $scope.method = 'count';
            $scope.filters[parentindex].checkMethod = true;
            console.log("count: ", parentindex);
            $scope.filters[parentindex].method = 'count';
            $scope.filters[parentindex].btntext = 'Count Of ' + $scope.countOfItems[
                index].name;




            $scope.hasDoneOrHasNotDone = false;
            $scope.hasCountOfClicked = true;
            $scope.hasDoneOrHasNotDoneClicked = false;
            console.log("index: ", index);
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
        $scope.segmenticons = [];
        $scope.selectedIcon = $scope.segments[0].name;

        for (var i = $scope.segments.length - 1; i >= 0; i--) {
            $scope.segmenticons.push({
                value: $scope.segments[i].name,
                label: $scope.segments[i].name
            })
        };


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


        $scope.chngquery = function (parentindex, index) {
            console.log("parentindex: ", parentindex);
            $scope.filters[parentindex].optext = $scope.queries[index].name;
            $scope.filters[parentindex].op = $scope.queries[index].key;
            console.log($scope.filters[parentindex].op);
            console.log($scope.filters);
        }

        $scope.runQuery = function () {
            console.log("run Query: ", $scope.filters);
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
                checkMethod: 'true',
                name: '',
                op: 'eq',
                optext: 'equal',
                val: ''
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

        $scope.showErr = false;
        $scope.errMsg = 'Enter the outlined fields';
        $scope.errorclass = '';

        $scope.hideErrorAlert = function () {
            $scope.showErr = false;
        }

        $scope.isErr = 'error';

        $scope.signupForm = function () {
            console.log($scope.filters);
            for (var i = 0; i < $scope.filters.length; i++) {
                console.log("val: ", $scope.filters[i].val);
                if ($scope.filters[i].val == '' && $scope.filters[i].method ==
                    'count') {
                    console.log("val: ", $scope.filters[i].val);
                    $scope.showErr = true;
                    // $scope.isErr = 'error';
                    // console.log("error class", $scope.isErr);
                } else {
                    $scope.showErr = false;
                    // $scope.isErr = '';
                }
            };
        }
    }
])

.controller('UserListCtrl', ['$scope', '$location', 'segment',
    'queryMatching', '$filter', 'countOfActions', 'hasNotDone',
    'hasDoneActions', 'ngTableParams', 'login', 'modelsQuery',
    'AppService', 'segment', 'queryMatching', 'eventNames',
    'userAttributes', 'lodash',
    function ($scope, $location, segment, queryMatching, $filter,
        countOfActions, hasNotDone, hasDoneActions,
        ngTableParams, login, modelsQuery, AppService, segment,
        queryMatching, eventNames, userAttributes, lodash) {

        var _ = lodash;

        var stringify = function (obj, prefix) {
            if (_.isArray(obj)) {
                return stringifyArray(obj, prefix);
            } else if ('[object Object]' == Object.prototype.toString.call(
                obj)) {
                return stringifyObject(obj, prefix);
            } else if ('string' == typeof obj) {
                return stringifyString(obj, prefix);
            } else {
                return prefix + '=' + encodeURIComponent(String(obj));
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
            if (!prefix) throw new TypeError('stringify expects an object');
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
            if (!prefix) throw new TypeError('stringify expects an object');
            for (var i = 0; i < arr.length; i++) {
                ret.push(stringify(arr[i], prefix + '[' + i + ']'));
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
                    ret.push(stringify(obj[key], prefix ? prefix + '[' +
                        encodeURIComponent(
                            key) + ']' : encodeURIComponent(key)));
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
                    name: eventNames.getEvents()[i]
                })
            };

            for (var i = 0; i < userAttributes.getUserAttributes()
                .length; i++) {
                attributes.push({
                    name: userAttributes.getUserAttributes()[i]
                })
            };



            console.log("allActions: ", allActions)


            console.log("inside UserListCtrl loginProvider: ", login.getLoggedIn());
            $scope.state = 'form-control';
            $scope.isErr = '';
            $scope.method = 'count';
            $scope.checkMethod = true;
            $scope.rootOperator = 'and';
            $scope.newFilterArray = [{
                    method: 'hasdone',
                    name: 'Create new chat',
                    op: '',
                    val: ''
                },

                {
                    method: 'count',
                    name: 'Logged In',
                    op: 'gt',
                    val: 20
                }
            ]


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

            $scope.changeFilterAttribute = function (parentindex, index,
                evt) {
                $scope.filters[parentindex].checkMethod = true;
                $scope.filters[parentindex].btntext = $scope.attributes[
                    index].name;
                $scope.filters[parentindex].method = 'attr';
                $scope.filters[parentindex].name = $scope.attributes[
                    index].name;
            }

            $scope.changeFilterHasDone = function (parentindex, index, evt) {
                $scope.method = 'hasdone';
                $scope.filters[parentindex].checkMethod = false;
                console.log("has done: ", parentindex);
                $scope.filters[parentindex].btntext = 'Has Done';
                $scope.filters[parentindex].method = 'hasdone';
                $scope.filters[parentindex].name = $scope.hasDoneItems[
                    index].name;
                $scope.filters[parentindex].op = '';
                $scope.filters[parentindex].optext = '';
                $scope.filters[parentindex].val = '';


                $scope.hasDoneOrHasNotDone = true;
                $scope.textHasDoneNotHasDone = $scope.hasDoneItems[index].name;
                $scope.hasDoneOrHasNotDoneClicked = true;
                $scope.hasCountOfClicked = false;
                $scope.selectFilterHasOrHasNotDone = 'Has done ';
                console.log("index: ", index);
            }

            $scope.changeFilterHasNotDone = function (parentindex, index,
                evt) {
                $scope.method = 'hasnotdone';
                $scope.filters[parentindex].checkMethod = false;
                console.log("has not done: ", parentindex);
                $scope.filters[parentindex].method = 'hasnotdone';
                $scope.filters[parentindex].btntext = 'Has Not Done ';
                $scope.filters[parentindex].name = $scope.hasNotDoneItems[
                    index].name;
                $scope.filters[parentindex].op = '';
                $scope.filters[parentindex].optext = '';
                $scope.filters[parentindex].val = '';
                console.log($scope.filters);



                $scope.hasDoneOrHasNotDone = true;
                $scope.textHasDoneNotHasDone = $scope.hasDoneItems[index].name;
                $scope.hasDoneOrHasNotDoneClicked = true;
                $scope.hasCountOfClicked = false;
                $scope.selectFilterHasOrHasNotDone = 'Has not done';
                console.log("index: ", index);
            }



            $scope.changeFilterCountOf = function (parentindex, index, evt) {
                $scope.method = 'count';
                $scope.filters[parentindex].checkMethod = true;
                console.log("count: ", parentindex);
                $scope.filters[parentindex].method = 'count';
                $scope.filters[parentindex].btntext = 'Count Of ' + $scope
                    .countOfItems[
                        index].name;
                $scope.filters[parentindex].name = $scope
                    .countOfItems[
                        index].name;



                $scope.hasDoneOrHasNotDone = false;
                $scope.hasCountOfClicked = true;
                $scope.hasDoneOrHasNotDoneClicked = false;
                console.log("index: ", index);
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
            $scope.segmenticons = [];
            $scope.selectedIcon = $scope.segments[0].name;

            for (var i = $scope.segments.length - 1; i >= 0; i--) {
                $scope.segmenticons.push({
                    value: $scope.segments[i].name,
                    label: $scope.segments[i].name
                })
            };


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


            $scope.chngquery = function (parentindex, index) {
                console.log("parentindex: ", parentindex);
                $scope.filters[parentindex].optext = $scope.queries[index]
                    .name;
                $scope.filters[parentindex].op = $scope.queries[index].key;
                console.log($scope.filters[parentindex].op);
                console.log($scope.filters);
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
                    checkMethod: 'true',
                    name: '',
                    op: 'eq',
                    optext: 'equal',
                    val: ''
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

            $scope.filtersBackend = [];

            $scope.queryObj = {};


            $scope.runQuery = function () {
                console.log("run Query: ", $scope.filters);
                for (var i = 0; i < $scope.filters.length; i++) {
                    $scope.filtersBackend.push({
                        method: $scope.filters[i].method,
                        type: 'feature',
                        name: $scope.filters[i].name,
                        op: $scope.filters[i].op,
                        val: $scope.filters[i].val

                    })
                };

                $scope.queryObj.list = $scope.selectedIcon.toLowerCase();
                $scope.queryObj.op = '$' + $scope.text.toLowerCase();
                $scope.queryObj.filters = $scope.filtersBackend;
                console.log('queryObj', $scope.queryObj);

                modelsQuery.runQueryAndGetUsers(AppService.getCurrentApp()
                    ._id, stringify($scope.queryObj));
            }

            $scope.showErr = false;
            $scope.errMsg = 'Enter the outlined fields';
            $scope.errorclass = '';

            $scope.hideErrorAlert = function () {
                $scope.showErr = false;
            }

            $scope.isErr = 'error';

            $scope.signupForm = function () {
                console.log($scope.filters);
                for (var i = 0; i < $scope.filters.length; i++) {
                    console.log("val: ", $scope.filters[i].val);
                    if ($scope.filters[i].val == '' && $scope.filters[i].method ==
                        'count') {
                        console.log("val: ", $scope.filters[i].val);
                        $scope.showErr = true;
                        // $scope.isErr = 'error';
                        // console.log("error class", $scope.isErr);
                    } else {
                        $scope.showErr = false;
                        // $scope.isErr = '';
                    }
                };
            }

        }


        console.log("App Id: ", AppService.getCurrentApp()
            ._id);

        modelsQuery.getQueries(AppService.getCurrentApp()
            ._id, fillData);


    }
])

.controller('TableCtrl', ['$scope', '$filter', 'ngTableParams', '$modal',
    'UidService', '$moment', 'UserList',

    function ($scope, $filter, ngTableParams, $modal, UidService, $moment,
        UserList) {

        $scope.title = "Write Message";
        // $scope.content = "Hello Modal<br />This is a multiline message!";

        var popupModal = $modal({
            scope: $scope,
            template: '/templates/usersmodule/message.modal.html',
            show: false
        });

        $scope.openModal = function () {
            popupModal.show();
            console.log(_.keys($scope.checkboxes.items));
            UidService.set(_.keys($scope.checkboxes.items));

        };

        /*$scope.hideModal = function () {
            popupModal.hide();
        }*/

        $scope.data = [];

        $scope.$watch(UserList.getUsers, function () {
            for (var i = 0; i < UserList.getUsers()
                .length; i++) {
                $scope.data.push({
                    id: UserList.getUsers()[i]._id,
                    email: UserList.getUsers()[i].email,
                    userkarma: UserList.getUsers()[i].healthScore,
                    datejoined: moment(UserList.getUsers()[i].firstSessionAt)
                        .format("MMMM Do YYYY"),
                    unsubscribed: UserList.getUsers()[i].unsubscribed
                })
            };
            $scope.columns = [{
                    title: '',
                    field: 'checkbox',
                    visible: true
                },
                {
                    title: 'Email',
                    field: 'email',
                    visible: true
                }, {
                    title: 'User Karma',
                    field: 'userkarma',
                    visible: true
                }, {
                    title: 'Date Joined',
                    field: 'datejoined',
                    visible: true
                }, {
                    title: 'Unsubscribed',
                    field: 'unsubscribed',
                    visible: true
                }
            ];

            $scope.tableParams = new ngTableParams({
                page: 1, 
                    count: 10, // count per page
                    filter: {
                        name: 'M' // initial filter
                    },
                    sorting: {
                        name: 'asc'
                    }
                }, {
                    total: $scope.data.length, // length of data
                    getData: function ($defer, params) {
                        // use build-in angular filter
                        var filteredData = params.filter() ?
                            $filter('filter')($scope.data, params
                                .filter()) :
                            data;
                        var orderedData = params.sorting() ?
                            $filter('orderBy')($scope.data,
                                params.orderBy()) :
                            $scope.data;
                        params.total(orderedData.length); // set total for recalc paginationemail

                        $defer.resolve(orderedData.slice((
                                params.page() -
                                1) * params.count(),
                            params.page() *
                            params.count()));
                    }
                });


            $scope.currentPage = 0;
            $scope.pageSize = 20;


            /*$scope.numberOfPages = function () {
                return Math.ceil($scope.data.length / $scope.pageSize);
            }*/
        })



        $scope.checkboxes = {
            'checked': false,
            items: {}
        };

        console.log("checkboxes: ", $scope.checkboxes);

        $scope.$watch('checkboxes.items', function (values) {
            console.log("$watch checkboxes: ", $scope.checkboxes.items);
        })

        // watch for check all checkbox
        /*$scope.$watch('checkboxes.checked', function (value) {
            console.log("checkbox value: ", value)
            angular.forEach($scope.data, function (item) {
                if (angular.isDefined(item.id)) {
                    $scope.checkboxes.items[item.id] = value;
                }
            });
        });

        $scope.$watch('checkboxes.items', function (values) {
            if (!$scope.data) {
                return;
            }
            var checked = 0,
                unchecked = 0,
                total = $scope.data.length;
            angular.forEach($scope.data, function (item) {
                checked += ($scope.checkboxes.items[item.id]) || 0;
                unchecked += (!$scope.checkboxes.items[item.id]) ||
                    0;
            });
            if ((unchecked == 0) || (checked == 0)) {
                $scope.checkboxes.checked = (checked == total);
            }
            // grayed checkbox
            angular.element(document.getElementById("select_all"))
                .prop("indeterminate", (checked != 0 && unchecked != 0));
        }, true);*/

        $scope.tabledropdown = {

        }

    }
])

.controller('sendMessageCtrl', ['$scope', 'MsgService', '$modal', 'UidService',
    function ($scope, MsgService, $modal, UidService) {
        console.log("inside send message ctrl");
        $scope.sendManualMessage = function () {
            MsgService.sendManualMessage($scope.sub, $scope.text,
                UidService.get());
        }
    }
])

.controller('ProfileCtrl', ['$scope',
    function ($scope) {

        // Get data from backend

        $scope.healthScore = '50';
        $scope.plan = 'Basic';
        $scope.planValue = '$25';
        $scope.renewal = '25 Mar 2014';
        $scope.firstSeen = '3 months ago';
        $scope.lastSession = '2 months ago';
        $scope.country = 'India';
        $scope.os = 'Ubuntu';
        $scope.browser = 'Mozilla Firefox';

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

        $scope.xAxisTickFormatFunction = function () {

            return function (d) {

                return d3.time.format('%x')(new Date(d)); //uncomment for date format

            }

        }

    }
])