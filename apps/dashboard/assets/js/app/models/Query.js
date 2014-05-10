angular.module('models.Query', ['services'])

.service('modelsQuery', ['$http', 'config', 'eventNames', 'userAttributes', 
    function ($http, config, eventNames, userAttributes) {
        this.getQueries = function (appId, callback) {

            var url = config.apiUrl + '/apps/' + appId +
                '/query/attributes';

            $http.get(url)
                .success(function (data) {
                    console.log("attributes: ", data);
                    eventNames.setEvents(data.eventNames);
                    userAttributes.setUserAttributes(data.userAttributes);
                    callback();
                })
                .error(callback);
        };

        this.runQueryAndGetUsers = function (appId, queryObj) {
            $http.get(config.apiUrl + '/apps/' + appId + '/query/?' +
                queryObj)
                .success(function (data) {
                    console.log("success in running query: ", data);
                })
                .error(function () {
                    console.log("error");
                })
        };
    }
])