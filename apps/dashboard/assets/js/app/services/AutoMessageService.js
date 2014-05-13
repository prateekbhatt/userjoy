angular.module('services.AutoMsgService', [])

.service('AutoMsgService', ['$log',

    function ($log) {

        var allAutoMsg = [];

        this.setAllAutoMsg = function (value) {
            allAutoMsg = value;
        };

        this.getAllAutoMsg = function () {
            return allAutoMsg;
        };

        return this;

    }
])