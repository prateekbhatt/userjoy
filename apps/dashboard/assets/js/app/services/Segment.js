angular.module('services.segmentService', [])

.service('segmentService', ['$log',

    function ($log) {

        var allSegments = [];
        var singleSegment = [];

        this.setSegments = function (value) {
            allSegments = value;
        };

        this.getSegments = function () {
            return allSegments;
        };

        this.setSingleSegment = function (value) {
            singleSegment = value;
        }

        this.getSingleSegment = function () {
            return singleSegment;
        }

        return this;

    }
])