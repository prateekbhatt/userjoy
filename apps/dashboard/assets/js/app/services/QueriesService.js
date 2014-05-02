angular.module('services.QueriesService', [])

.service('segment', [

    function () {
        var selectedSegment,
            allSegments = [];

        return {
            get: {
                all: function () {
                    return allSegments;
                },
                selected: function () {
                    return selectedSegment;
                }
            },
            set: {
                all: function (segments) {
                    allSegments = segments;
                },
                selected: function (newSelectedSegment) {
                    selectedSegment = newSelectedSegment;
                }
            }
        };
    }
])

.service('queryMatching', [

    function () {
        var selectedQuery,
            allQueries = [];

        return {
            get: {
                all: function () {
                    return allQueries;
                },
                selected: function () {
                    return selectedQuery;
                }
            },
            set: {
                all: function (Query) {
                    allQueries = Query;
                },
                selected: function (newSelectedQuery) {
                    selectedQuery = newSelectedQuery;
                }
            }
        };
    }
])

.service('countOfActions', [

    function () {
        var allCountOfActions = [];

        this.setCountOfActions = function (value) {
            allCountOfActions = value;
        }

        this.getCountOfActions = function () {
            return allCountOfActions;
        }

        return this;
    }
])

.service('hasNotDone', [

    function () {
        var allHasNotDoneActions = [];

        this.setAllHasNotDoneActions = function (value) {
            allHasNotDoneActions = value;
        }

        this.getAllHasNotDoneActions = function () {
            return allHasNotDoneActions;
        }

        return this;
    }
])

.service('hasDoneActions', [

    function () {
        var allHasDoneActions = [];

        this.setAllHasDoneActions = function (value) {
            allHasDoneActions = value;
        }

        this.getAllHasDoneActions = function () {
            return allHasDoneActions;
        }

        return this;
    }
]);