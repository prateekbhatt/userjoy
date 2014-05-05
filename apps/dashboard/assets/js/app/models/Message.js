angular.module('models.message', ['services'])

.service('MsgService', ['$http', 'config', 'AppService',
    'InboxMsgService', '$modal', '$location', 'ThreadService',
    function ($http, config, AppService, InboxMsgService, $modal, $location, ThreadService) {
        this.sendManualMessage = function (sub, text, uid) {
            console.log("uid: ", uid)
            var data = {
                sName: 'Savinay',
                sub: sub,
                text: text,
                type: 'email',
                uid: '53666d4ba95d798710e09be7'
            }
            console.log("message data: ", data);
            console.log("LIAS", AppService.getCurrentApp());
            var appId = AppService.getCurrentApp()
                ._id;


            $http.post(config.apiUrl + '/apps/' + appId + '/conversations',
                data)
                .success(function (data) {
                    console.log("success");

                })
                .error(function () {
                    console.log("error");
                })

        };

        this.getManualMessage = function (appId, callback) {
            console.log("going to fetch msgs");
            $http.get(config.apiUrl + '/apps/' + appId + '/conversations')
                .success(function (data) {
                    console.log("success getting messages");
                    InboxMsgService.setInboxMessage(data);
                    console.log("setting msg: ", InboxMsgService.getInboxMessage());
                    callback();
                })
                .error(callback);
        };

        this.getMessageThread = function (appId, coId, callback) {
            $http.get(config.apiUrl + '/apps/' + appId + '/conversations/' +
                coId)
                .success(function (data) {
                    console.log("success getting msg thread");
                    console.log("msg thread: ", data);
                    ThreadService.setThread(data);
                    callback();
                })
                .error(callback);
        }

        this.closeConversationRequest = function (appId, coId, callback) {

            $http.put(config.apiUrl + '/apps/' + appId + '/conversations/' + coId + '/closed')
                .success(function (data){
                    console.log("success closing conversation");
                    callback();
                })
                .error(callback);
        }

        this.getUnreadMessages = function (appId, callback) {
            $http.get(config.apiUrl + '/apps/' + appId + '/messages/unread')
                .success(function(data){
                    console.log("success unread msgs");
                    InboxMsgService.setUnreadMessage(data);
                    callback();
                })
                .error(callback);
        }

        this.replyToMsg = function (appId, coId, reply, accid, callback) {

            var data = {
                text: reply
            }

            console.log("data replyToMsg: ", data);

            $http.post(config.apiUrl + '/apps/' + appId + '/conversations/' + coId, data)
                .success(function(data) {
                    console.log("success");
                    ThreadService.setReply(data);
                    callback();
                })
                .error(callback);

        }

        this.reopenConversation = function (appId, coId, callback) {
            $http.put(config.apiUrl + '/apps/' + appId + '/conversations/' + coId + '/reopened')
                .success(function (data){
                    console.log("success reopening conversation");
                    callback();
                })
                .error(callback);
        }

        this.getClosedConversations = function(appId, callback) {
            $http.get(config.apiUrl + '/apps/' + appId + '/conversations?filter=closed')
                .success(function(data) {
                    console.log("closed conversations: ", data);
                    InboxMsgService.setClosedMessage(data);
                    callback();
                })
                .error (callback);
        }
    }
])