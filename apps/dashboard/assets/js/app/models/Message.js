angular.module('models.message', ['services'])

.service('MsgService', ['$http', 'config', 'AppService', 'InboxMessagesService',
    function ($http, config, AppService, InboxMessagesService) {
        this.sendManualMessage = function (sub, text) {
            var data = {
                sName: 'Savinay',
                sub: sub,
                text: text,
                type: 'email',
                uid: '535e5aafddda18934d1a2c6f'
            }
            console.log("message data: ", data);
            console.log("LIAS", AppService.getCurrentApp());
            var appId = AppService.getCurrentApp()
                ._id;


            $http.post(config.apiUrl + '/apps/' + appId + '/messages', data)
                .success(function (data) {
                    console.log("success");
                })
                .error(function () {
                    console.log("error");
                })

        }

        this.getManualMessage = function(appId) {

            $http.get(config.apiUrl + '/apps/' + appId + '/messages')
                .success(function(data){
                    InboxMessagesService.setInboxMessage(data);
                    console.log("success");
                    console.log(data);
                }).error(function(){
                    console.log("error");
                })

            return InboxMessagesService.getInboxMessage(); 

        }
    }
])
