angular.module('services.ErrMsgService', [])

.service('ErrMsgService', ['$log',

    function ($log) {

        var errMsg = '';

        this.setErrorMessage = function (value) {
            errMsg = value;
        };

        this.getErrorMessage = function () {
            return errMsg;
        };

        return this;

    }
])