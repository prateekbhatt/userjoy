angular
    .module('models.Invite', ['services'])
    .service('InviteModel', ['$http', 'config', '$location', 'AuthService',
        function ($http, config, $location, AuthService) {
            this.registerInvitedMember = function (email, password,
                inviteId) {
                var data = {
                    email: email,
                    password: password,
                    inviteId: inviteId
                }
                $http.post(config.apiUrl + '/account', data)
                    .success(function (successdata) {
                        console.log(
                            "account created for invited member");
                        console.log("email: ", data.email);
                        console.log("pwd: ", data.password);
                        AuthService.attemptLogin(data.email, data.password);
                        // $location.path('/users/list');
                    })
                    .error(function () {
                        console.log(
                            "error in creating invited member account"
                        );
                    })
            }

            return this;
        }
    ])