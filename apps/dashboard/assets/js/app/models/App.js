angular
  .module('models.apps', ['services'])
  .service('AppModel', ['$http', 'config', '$state', 'AppService',
    '$location',
    function ($http, config, $state, AppService, $location) {

      this.get = function (cb) {

        $http
          .get(config.apiUrl + '/apps')
          .success(function (data) {
            cb(null, data);
          })
          .error(cb);

      };

      this.getSingleApp = function (appId, cb) {
        $http.get(config.apiUrl + '/apps/' + appId)
          .success(function (data) {
            console.log("current App: --> from App Model: ", data);
            AppService.setCurrentApp(data);
            AppService.setAppName(data.name);
            cb();
          })
          .error(cb);
      }


      this.updateName = function (name, appId, cb) {

        var data = {
          name: name
        };

        var putUrl = config.apiUrl + '/apps/' + appId + '/name';

        $http
          .put(putUrl, data)
          .success(function (data) {
            cb(null, data);
          })
          .error(cb)

      }

      this.addNewApp = function (data, appId) {
        $http
          .put(config.apiUrl + '/apps/' + appId, data)
          .success(function (savedApp) {
            // $state.transitionTo('addcode');
            AppService.new(savedApp);
            AppService.setCurrentApp(savedApp);
            AppService.setAppName(savedApp.name);
            $location.path('/apps/' + AppService.getCurrentApp()
              ._id + '/invite')
            console.log("apps created: ", AppService.getLoggedInApps(),
              savedApp);
          })
      }

      this.addAnotherNewApp = function (data) {
        $http
          .post(config.apiUrl + '/apps', data)
          .success(function (savedApp) {
            // $state.transitionTo('addcode');
            AppService.new(savedApp);
            AppService.setCurrentApp(savedApp);
            AppService.setAppName(savedApp.name);
            $location.path('/apps/' + AppService.getCurrentApp()
              ._id + '/addcode/newapp');
            console.log("apps created: ", AppService.getLoggedInApps(),
              savedApp);
          })
          .error(function () {
            console.log("error");
          })
      }

      this.addNewMember = function (data, appId, cb) {
        console.log("data: ", data);
        $http.post(config.apiUrl + '/apps/' + appId + '/invites',
          data)
          .success(function (data) {
            console.log("success");
            cb();
          })
          .error(cb);

      }

      this.redirectUser = function (appId, inviteId, cb) {
        $http.get(config.apiUrl + '/apps/' + appId + '/invites/' +
          inviteId)
          .success(function (data) {
            console.log("data: ", data);
            AppService.setEmail(data.email);
            if (data.message == 'REDIRECT_TO_SIGNUP') {
              $location.path('/signup');
            }

            if (data.message == 'IS_TEAM_MEMBER') {
              $location.path('/login');
            }

            if (data.message == 'REDIRECT_TO_LOGIN') {
              $location.path('/login');
            }
            cb();
          })
          .error(cb);
      }

      this.updateColor = function (appId, color) {
        var data = {
          color: color
        }
        console.log("data: ", data);
        $http.put(config.apiUrl + '/apps/' + appId + '/color', data)
          .success(function (data) {
            console.log("updated color: ", data);
          })
          .error(function () {
            console.log("error");
          })
      }

      this.checkIfActive = function (appId, cb) {
        $http.put(config.apiUrl + '/apps/' + appId + '/activate')
          .success(function (data) {
            console.log("success: ", data);
            cb(null, data);
          })
          .error(cb);
      }



      this.checkIfActiveNewApp = function (appId, cb) {
        $http.put(config.apiUrl + '/apps/' + appId + '/activate')
          .success(function (data) {
            console.log("success: ", data);
            cb(null, data);
          })
          .error(cb);
      }


      this.sendCodeToDeveloper = function (appId, email, cb) {
        var data = {
          email: email
        }
        $http.post(config.apiUrl + '/apps/' + appId +
          '/send-code-to-developer', data)
          .success(function (data) {
            console.log("success sending code to developer");
            cb();
          })
          .error(cb);
      }

      this.showFeedBackMsg = function (appId, status, cb) {
        var data = {
          status: status
        }
        console.log("data: ", data);
        $http.put(config.apiUrl + '/apps/' + appId + '/show-message-box',
          data)
          .success(function (data) {
            console.log("success", data);
            cb();
          })
          .error(cb);
      }
    }
  ])
