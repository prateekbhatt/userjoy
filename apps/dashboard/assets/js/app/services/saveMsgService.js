angular.module('services.saveMsgService', [])

.service('saveMsgService', ['$log',

    function ($log) {

        var savedMsg = '';
        var sub = '';
        var title = '';

        this.setMsg = function (value) {
            savedMsg = value;
        };

        this.getMsg = function () {
            return savedMsg;
        };

        this.setSub = function (value) {
            sub = value;
        }

        this.getSub = function () {
            return sub
        }

        this.setTitle = function (value) {
            title = value;
        }

        this.getTitle = function () {
            return title;
        }

        return this;

    }
])