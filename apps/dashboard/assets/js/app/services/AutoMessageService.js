angular.module('services.AutoMsgService', [])

.service('AutoMsgService', ['$log',

    function ($log) {

        var allAutoMsg = [];
        var singleAutoMsg = [];

        this.setAllAutoMsg = function (value) {
            allAutoMsg = value;
        };

        this.getAllAutoMsg = function () {
            return allAutoMsg;
        };

        this.setSingleAutoMsg = function (value) {
            singleAutoMsg = value;
        }

        this.getSingleAutoMsg = function () {
            return singleAutoMsg;
        }

        return this;

    }
])