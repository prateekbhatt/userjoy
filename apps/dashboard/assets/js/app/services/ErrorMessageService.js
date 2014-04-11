angular.module('services.ErrorMessageService', [])

.service('ErrorMessageService', ['$log',

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