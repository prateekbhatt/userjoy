angular.module('models.user', ['services'])

.service('UserModel', ['$http', 'config', '$location', 'InboxMsgService',
    'UserList', 'NotesService',
    function ($http, config, $location, InboxMsgService, UserList,
        NotesService) {

        this.getUserProfile = function (id, appId) {
            $http.get(config.apiUrl + '/apps/' + appId + '/users/' + id)
                .success(function (data) {
                    console.log("success: ", data);
                    UserList.setUserEmail(data.email);
                    $location.path('/apps/' + appId + '/users/profile/' + id);
                })
                .error(function (data) {
                    console.log("error: ", data);
                })
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

        this.getEvents = function (appId, uid, fromTime, toTime, cb) {
            $http.get(config.apiUrl + '/apps/' + appId + '/users/' + uid + '/events?from=' + fromTime + '&to=' + toTime)
                .success(function(data) {
                    console.log("success: ", data);
                    cb(null, data);
                })
                .error(cb);
        }
    }
]);