angular.module('models.Segment', ['services'])

.service('modelsSegment', ['$http', 'config',
    function ($http, config) {
        this.createSegment = function (appId, data) {
            $http.post(config.apiUrl + '/apps/' + appId + '/segments', data)
                .success(function(data) {
                    console.log("success");
                })
                .error(function (data) {
                    console.log("error");
                })
        }
    }
])