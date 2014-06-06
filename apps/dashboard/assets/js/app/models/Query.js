angular.module('models.Query', ['services'])

.service('modelsQuery', ['$http', 'config', 'eventNames', 'userAttributes',
  'UserList',
  function ($http, config, eventNames, userAttributes, UserList) {
    this.getQueries = function (appId, callback) {

      var url = config.apiUrl + '/apps/' + appId +
        '/query/attributes';

      $http.get(url)
        .success(function (data) {
          console.log("attributes: ", data);
          eventNames.setEvents(data.events);
          console.log("events: ", eventNames.getEvents());
          userAttributes.setUserAttributes(data.userAttributes);
          callback();
        })
        .error(callback);
    };

    this.runQueryAndGetUsers = function (appId, queryObj, callback) {
      $http.get(config.apiUrl + '/apps/' + appId + '/query/?' +
        queryObj)
        .success(function (data) {
          console.log("data: ", data);
          UserList.setUsers(data);
          callback();
        })
        .error(callback);
    };
  }
])