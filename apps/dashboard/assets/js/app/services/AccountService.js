angular.module('services.AccountService', [])

.service('AccountService', ['$log',

    function ($log) {

        var loggedInAccount = '';

        this.set = function (accountObject) {
            loggedInAccount = accountObject;
        };

        this.get = function () {
            return loggedInAccount;
        };

        return this;

    }
])