angular.module('services.LoginService', [])

.service('LoginService', [

    function () {
        this.attemptLogin = function (email, password) {
            // create your request to your resource or $http request

            var dummyUser = {
                email: 'savinay@dodatado.com',
                password: 'testtest'
            }

            if (email === dummyUser.email && password === dummyUser.password) {
                return true;
            } else {
                return false;
            }

        };

        return this;
    }
])