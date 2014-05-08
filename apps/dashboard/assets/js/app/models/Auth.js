angular.module('models.auth', ['services'])

.service('AuthService', ['$http', 'utils', 'ipCookie', 'LoginService',
    '$log', 'config', '$state', '$location', 'AppService', 
    'ErrMsgService', 'authService', 'login', 
    function ($http, utils, ipCookie, LoginService, $log, config, $state,
        $location, AppService, ErrMsgService, authService, login) {

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
                    // login.setLoggedIn(true);
                    console.log("loginProvider: ", login.getLoggedIn());
                    if(login.getLoggedIn()) {
                        $state.go('users.list');
                    }
                    $http.get(config.apiUrl + '/apps')
                        .success(function (data) {
                            console.log("loggedin Apps: ", data);

                            AppService.setLoggedInApps(
                                data);

                            if (AppService.getLoggedInApps()
                                .length) {
                                console.log(AppService.getLoggedInApps());
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
                    ErrMsgService.setErrorMessage(err.error);
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
                    login.setLoggedIn(false);
                    $log.info(arguments);
                    $location.path('/login');
                })
        }

        return this;

    }
]);
