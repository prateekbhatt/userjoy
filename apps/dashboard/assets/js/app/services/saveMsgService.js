angular.module('services.saveMsgService', [])

.service('saveMsgService', ['$log',

    function ($log) {

        var savedMsg = '';

        this.setMsg = function (value) {
            savedMsg = value;
        };

        this.getMsg = function () {
            return savedMsg;
        };

        return this;

    }
])