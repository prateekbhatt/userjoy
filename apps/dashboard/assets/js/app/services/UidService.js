angular.module('services.UidService', [])

.service('UidService', ['$log',

    function ($log) {

        var uid = '';

        this.set = function (value) {
            uid = value;
        };

        this.get = function () {
            return uid;
        };

        return this;

    }
])