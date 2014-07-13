angular.module('services.segmentService', [])

.service('segmentService', ['$log',

  function ($log) {

    var allSegments = [];
    var singleSegment = [];
    var segmentId = '';

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

    this.setSegmentId = function (value) {
      segmentId = value;
    }

    this.getSegmentId = function () {
      return segmentId;
    }

    return this;

  }
])