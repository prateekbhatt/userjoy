angular.module('models.message', ['services'])

.service('MsgService', ['$http', 'config', 'AppService',
    'InboxMessagesService', '$modal',
    function ($http, config, AppService, InboxMessagesService, $modal) {
        this.sendManualMessage = function (sub, text, uid) {
            console.log("uid: ", uid)
            var data = {
                sName: 'Savinay',
                sub: sub,
                text: text,
                type: 'email',
                uid: uid
            }
            console.log("message data: ", data);
            console.log("LIAS", AppService.getCurrentApp());
            var appId = AppService.getCurrentApp()
                ._id;


            $http.post(config.apiUrl + '/apps/' + appId + '/messages',
                data)
                .success(function (data) {
                    console.log("success");

                })
                .error(function () {
                    console.log("error");
                })

        }

        this.getManualMessage = function (appId) {

            $http.get(config.apiUrl + '/apps/' + appId + '/messages')
                .success(function (data) {
                    InboxMessagesService.setInboxMessage(data);
                    console.log("success");
                    console.log(data);
                })
                .error(function () {
                    console.log("error");
                })

            return InboxMessagesService.getInboxMessage();

        }
    }
])