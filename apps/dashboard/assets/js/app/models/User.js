angular.module('models.user', ['services'])

.service('UserModel', ['$http', 'config', '$location', 'InboxMsgService',
  'UserList', 'NotesService',
  function ($http, config, $location, InboxMsgService, UserList,
    NotesService) {

    this.getUserProfile = function (id, appId, cb) {
      $http.get(config.apiUrl + '/apps/' + appId + '/users/' + id)
        .success(function (data) {
          console.log("success: ", data);
          UserList.setUserEmail(data.email);
          cb(null, data, id);

        })
        .error(cb);
    }

    this.getLatestConversations = function (appId, uid, cb) {
      $http.get(config.apiUrl + '/apps/' + appId + '/users/' + uid +
        '/conversations')
        .success(function (data) {
          console.log("msg: ", data);
          InboxMsgService.setLatestConversations(data);
          cb();
        })
        .error(cb);
    }

    this.createNote = function (appId, uid, data, cb) {
      $http.post(config.apiUrl + '/apps/' + appId + '/users/' + uid +
        '/notes', data)
        .success(function (data) {
          console.log("success");
          var notes = NotesService.getNotes();
          notes.push(data);
          NotesService.setNotes(notes);
          console.log("allnotes: ", NotesService.getNotes());
          cb(null, data);
        })
        .error(cb);
    }

    this.getNotes = function (appId, uid, cb) {
      $http.get(config.apiUrl + '/apps/' + appId + '/users/' + uid +
        '/notes')
        .success(function (data) {
          console.log("notes: ", data);
          NotesService.setNotes(data);
          cb();
        })
        .error(cb);
    }

    this.getEvents = function (appId, uid, fromTime, cb) {
      $http.get(config.apiUrl + '/apps/' + appId + '/users/' + uid +
        '/events?date=' + fromTime)
        .success(function (data) {
          console.log("success: ", data, fromTime);
          cb(null, data, fromTime);
        })
        .error(cb);
    }

    this.getEngagementScore = function (appId, uid, fromScoreTime,
      toScoreTime, cb) {
      $http.get(config.apiUrl + '/apps/' + appId + '/users/' + uid +
        '/scores?from=' + fromScoreTime + '&to=' + toScoreTime)
        .success(function (data) {
          console.log("success getting scores --- >>>>", data);
          cb(null, data);
        })
        .error(cb);
    }
  }
]);