angular.module('models.automate', ['services'])

.service('modelsAutomate', ['$http', 'config', 'AutoMsgService',
    function ($http, config, AutoMsgService) {
        this.getAllAutoMessages = function (appId, callback) {
            $http.get(config.apiUrl + '/apps/' + appId + '/automessages')
                .success(function (data) {
                    AutoMsgService.setAllAutoMsg(data);
                    console.log("Auto Msgs: ", AutoMsgService.getAllAutoMsg());
                    callback();
                })
                .error (callback)
        }

        this.createAutoMessage = function (appId, data) {
            $http.post(config.apiUrl + '/apps/' + appId + '/automessages', data)
                .success(function(data) {
                    console.log("data: ", data)
                })
                .erro(function(data){
                    console.log("error");
                })
        }
    }
])