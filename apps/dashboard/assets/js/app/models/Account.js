angular
  .module('models.account', ['services'])
  .service('AccountModel', ['$http', 'config', '$location',
    function ($http, config, $location) {

      this.get = function (cb) {

        $http
          .get(config.apiUrl + '/account')
          .success(function (data) {
            cb(null, data);
          })
          .error(cb);

      };


      this.updateName = function (name, cb) {

        var data = {
          name: name
        };

        $http
          .put(config.apiUrl + '/account/name', data)
          .success(function (data) {
            cb(null, data);
          })
          .error(cb)

      }

      this.updatePwd = function (currPwd, newPwd, cb) {
        var data = {
          currentPassword: currPwd,
          newPassword: newPwd
        }
        console.log("data: ", data);

        $http.put(config.apiUrl + '/account/password/update', data)
          .success(function (data) {
            cb(null, data);
          })
          .error(cb)
      }

      this.forgotPassword = function (email, cb) {
        var data = {
          email: email
        };
        console.log("data: ", data);
        $http.put(config.apiUrl + '/account/forgot-password', data)
          .success(function (data) {
            console.log("success sending email forgot password");
            cb(null, data);
          })
          .error(cb);
      }

      this.resetPasswordNew = function (tokenId, password) {
        var data = {
          token: tokenId,
          password: password
        };
        $http.put(config.apiUrl + '/account/forgot-password/new', data)
          .success(function (data) {
            console.log("password successfully changed");
            $location.path('/login');
          })
          .error(function () {
            console.log("error in setting new pwd");
          })
      }

      this.verifyEmail = function (id, tokenId) {
        $http.get('/account/' + id + '/verify-email/' + tokenId)
          .success(function () {
            $location.path('/login');
          })
          .error(function () {
            console.log("redirect to signup");
            // TODO: Change in production
            if (window.location.href.split("/")[2] == 'app.do.localhost') {
              window.location.href = "http://do.localhost/signup";
            } else {
              window.location.href = "http://userjoy.co/signup";
            }
          })
      }
    }
  ])