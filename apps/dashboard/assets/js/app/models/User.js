angular.module('models.user', ['services'])

.service('UserModel', ['$http', 'config', '$location', 'InboxMsgService', 'UserList',
    function ($http, config, $location, InboxMsgService, UserList) {

        this.getUserProfile = function (id, appId) {
            $http.get(config.apiUrl + '/apps/' + appId + '/users/' + id)
                .success(function (data) {
                    console.log("success: ", data);
                    UserList.setUserEmail(data.email);
                    $location.path('/users/profile/' + id);
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
    }
]);