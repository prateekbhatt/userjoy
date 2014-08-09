angular.module('models.auth', ['services'])

.service('AuthService', ['$http', 'utils', 'ipCookie', 'LoginService',
  '$log', 'config', '$state', '$location', 'AppService',
  'ErrMsgService', 'authService', 'login', '$rootScope', 'AccountModel',
  'AppModel',
  function ($http, utils, ipCookie, LoginService, $log, config, $state,
    $location, AppService, ErrMsgService, authService, login,
    $rootScope, AccountModel, AppModel) {

    this.attemptLogin = function (email, password, callback) {

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
            path: '/',
            domain: config.cookieDomain
          });
          LoginService.setUserAuthenticated(true);
          login.setLoggedIn(true);
          $rootScope.loggedIn = true;
          console.log("$rootScope loggIn: ", $rootScope.loggedIn);
          console.log("loginProvider Auth js: ", login.getLoggedIn());
          $http.get(config.apiUrl + '/apps')
            .success(function (data) {
              console.log("loggedin Apps: ", data);
              AppService.setLoggedInApps(
                data);

              if (AppService.getLoggedInApps()
                .length > 0) {


                AccountModel.get(function (err, acc) {
                  if (err) {
                    console.log("error");
                    return;
                  }
                  console.log("account ===================: ", acc);
                  if (acc.defaultApp) {
                    var callback = function (err) {
                      if (err) {
                        console.log("error");
                        return;
                      }

                      if (AppService.getCurrentApp()
                        .isActive) {
                        $location.path('/apps/' + AppService.getCurrentApp()
                          ._id + '/users/list');
                      } else {
                        $location.path('/apps/' + AppService.getCurrentApp()
                          ._id + '/addcode');
                      }
                    }
                    AppModel.getSingleApp(acc.defaultApp, callback);

                  } else {

                    console.log("AppService data Auth.js", AppService.getLoggedInApps());

                    var data = {
                      defaultApp: AppService.getLoggedInApps()[0]._id
                    }
                    AccountModel.updateDefaultApp(data, function (err,
                      updatedApp) {

                      if(err) {
                        console.log("error");
                        return;
                      }

                      console.log("updated app: ", updatedApp);
                      if (AppService.getLoggedInApps()[0].isActive) {
                        $location.path('/apps/' + AppService.getLoggedInApps()[
                          0]._id + '/users/list');
                      } else {
                        console.log(
                          "Auth.js redirecting to addcode url");
                        $location.path('/apps/' + AppService.getLoggedInApps()[
                          0]._id + '/addcode');
                      }
                      AppService.setCurrentApp(AppService.getLoggedInApps()[
                        0]);
                      AppService.setAppName(AppService.getLoggedInApps()[
                        0].name);

                    });


                  }

                })

              } else {
                $state.go('login');
                // AppService.setAppName('Apps');
              }
            })
            .error(function () {
              $log.error("error in fetching /apps");
              // TODO
            })
          callback(null);
        })
        .error(callback);
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
          $rootScope.loggedIn = false;
          $log.info(arguments);
          $location.path('/login');
        })
    }

    // return this;

  }
]);
