angular.module('models.auth', ['services'])

.service('AuthService', ['$http', 'utils', 'ipCookie', 'LoginService',
    '$log', 'config', '$state', '$location', 'LoggedInAppService', 
    'ErrorMessageService', 'authService',  
    function ($http, utils, ipCookie, LoginService, $log, config, $state,
        $location, LoggedInAppService, ErrorMessageService, authService) {

        this.attemptLogin = function (email, password) {

            var loginSuccessful;

            var data = {
                email: email,
                password: password
            }
            // post $http request to /auth/login

            $http.post(config.apiUrl + '/auth/login', data)
                .success(function (data) {

                    authService.loginConfirmed();
                    ipCookie('loggedin', "true", {
                        path: '/'
                    });

                    LoginService.setUserAuthenticated(true);

                    $http.get(config.apiUrl + '/apps')
                        .success(function (data) {
                            console.log("loggedin Apps: ", data);

                            LoggedInAppService.setLoggedInApps(
                                data);

                            if (LoggedInAppService.getLoggedInApps()
                                .length) {
                                console.log(LoggedInAppService.getLoggedInApps());
                                $state.go('users.list');
                            } else {
                                $state.go('onboarding');
                            }
                            // window.location.reload();

                        })
                        .error(function () {
                            $log.error("error in fetching /apps");
                            // TODO
                        })
                })
                .error(function (err) {
                    $log.error("error in signing in");
                    console.log(err.error);
                    ErrorMessageService.setErrorMessage(err.error);
                })
        };

        this.logout = function () {
            //http post request
            $http.post(config.apiUrl + '/auth/logout')
                .success(function () {
                    ipCookie.remove('loggedin', {
                        path: '/'
                    });
                    LoginService.setUserAuthenticated(false);
                    $log.info(arguments);
                    $location.path('/login');
                })
        }

        return this;

    }
]);