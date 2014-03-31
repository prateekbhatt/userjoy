angular.module('services.segmentQueryService', [])

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