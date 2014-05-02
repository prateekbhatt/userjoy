angular.module('services.ThreadService', [])

.service('ThreadService', ['$log',

    function ($log) {

        var threadMsg = [];

        this.setThread = function (value) {
            console.log("setting thread conversation");
            threadMsg = value;
        };

        this.getThread = function () {
            return threadMsg;
        };

        return this;

    }
])