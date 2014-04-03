angular.module('models.auth', ['services'])

.service('AuthService', ['$http', 'utils', 'ipCookie', 'LoginService',
    '$log', 'config', '$state', '$location',
    function ($http, utils, ipCookie, LoginService, $log, config, $state, $location) {

        this.attemptLogin = function (email, password) {

            var loginSuccessful;

            var data = {
                email: email,
                password: password
            }
            // create your request to your resource or $http request

            $http.post(config.apiUrl + '/auth/login', data).success(function(data){
                $log.info("login successful", arguments);
                ipCookie('loggedin', "true", { path: '/'});
                LoginService.setUserAuthenticated(true);
                $state.transitionTo('users.list');
                loginSuccessful = true;
                console.log("loginSuccessful value: ", loginSuccessful);
            })

            // console.log("loginSuccessful value outside http req:", loginSuccessful);
            // return loginSuccessful;

            /*if (email === dummyUser.email && password === dummyUser.password) {
                ipCookie('loggedin', "true", { path: '/'});
                LoginService.setUserAuthenticated(true);
                // $log.info("Auth service", LoginService.getUserAuthenticated());
                return true;
            } else {
                ipCookie.remove('loggedin', { path: '/'});
                LoginService.setUserAuthenticated(false);
                // $log.info("Auth service", LoginService.getUserAuthenticated());
                return false;
            }*/

        };

        this.logout = function () {
            //http post request
            $http.post(config.apiUrl + '/auth/logout').success(function(){
                ipCookie.remove('loggedin', { path: '/'});
                LoginService.setUserAuthenticated(false);
                $log.info(arguments);
                $location.path('/login');
            })
        }

        return this;

    }
]);