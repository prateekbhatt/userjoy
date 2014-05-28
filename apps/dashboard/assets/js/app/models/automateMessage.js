angular.module('models.automate', ['services'])

.service('modelsAutomate', ['$http', 'config', 'AutoMsgService', '$location',
    'ErrMsgService',
    function ($http, config, AutoMsgService, $location, ErrMsgService) {
        this.getAllAutoMessages = function (appId, callback) {
            $http.get(config.apiUrl + '/apps/' + appId + '/automessages')
                .success(function (data) {
                    AutoMsgService.setAllAutoMsg(data);
                    console.log("Auto Msgs: ", AutoMsgService.getAllAutoMsg());
                    callback();
                })
                .error(callback)
        }

        this.createAutoMessage = function (appId, data) {
            $http.post(config.apiUrl + '/apps/' + appId + '/automessages',
                data)
                .success(function (data) {
                    console.log("data: ", data)
                })
                .error(function () {
                    console.log("error");
                })
        }

        this.saveAutoMsg = function (appId, data) {
            $http.post(config.apiUrl + '/apps/' + appId + '/automessages',
                data)
                .success(function (response) {
                    console.log("success in creating automsg: ",
                        response);
                    AutoMsgService.setSingleAutoMsg(response);
                    if (data.type === "email") {
                        $location.path('/apps/' + appId +
                            '/messages/automate/test');
                    }

                    if(data.type === 'notification') {
                        $location.path('/apps/' + appId + '/messages/automate/live');
                    }
                })
                .error(function (err) {
                    console.log("error in creating automsg");
                    ErrMsgService.setErrorMessage(err.error);
                })
        }

        this.sendTestEmail = function (appId, autoMsgId) {
            $http.put(config.apiUrl + '/apps/' + appId + '/automessages/' +
                autoMsgId + '/send-test')
                .success(function (data) {
                    console.log("success");
                    $location.path('/apps/' + appId +
                        '/messages/automate/live');
                })
                .error(function () {
                    console.log("error");
                })
        }

        this.makeMsgLive = function (appId, autoMsgId) {
            $http.put(config.apiUrl + '/apps/' + appId + '/automessages/' +
                autoMsgId + '/active/true')
                .success(function (data) {
                    console.log("message is live");
                })
                .error(function () {
                    console.log("error in making message live");
                })
        }

        this.deActivateMsg = function (appId, autoMsgId) {
            $http.put(config.apiUrl + '/apps/' + appId + '/automessages/' +
                autoMsgId + '/active/false')
                .success(function (data) {
                    console.log("message is deactive");
                })
                .error(function () {
                    console.log("error in making message deactive");
                })
        }
    }
])