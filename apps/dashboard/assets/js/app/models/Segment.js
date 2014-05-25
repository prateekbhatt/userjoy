angular.module('models.Segment', ['services'])

.service('modelsSegment', ['$http', 'config', 'segmentService',
    function ($http, config, segmentService) {
        this.createSegment = function (appId, data) {
            $http.post(config.apiUrl + '/apps/' + appId + '/segments',
                data)
                .success(function (data) {
                    // segmentService
                    console.log("success");
                    segmentService.setSegments(data.name);
                })
                .error(function (data) {
                    console.log("error");
                })
        }

        this.getAllSegments = function (appId, callback) {
            $http.get(config.apiUrl + '/apps/' + appId + '/segments')
                .success(function (data) {
                    console.log(data);
                    segmentService.setSegments(data);
                    callback();
                })
                .error(callback);
        }

        this.getSegment = function (appId, segmentId, callback) {
            $http.get(config.apiUrl + '/apps/' + appId + '/segments/' +
                segmentId)
                .success(function (data) {
                    console.log("success getting a segment: ", data);
                    segmentService.setSingleSegment(data);
                    console.log("single segment: ", segmentService.getSingleSegment());
                    callback();
                })
                .error(callback);
        }

        this.updateSegment = function (appId, segmentId, data) {
            $http.put(config.apiUrl + '/apps/' + appId + '/segments/' +
                segmentId, data)
                .success(function (data) {
                    console.log("success: ", data);
                })
                .error(function () {
                    console.log("error");
                })
        }
    }
])