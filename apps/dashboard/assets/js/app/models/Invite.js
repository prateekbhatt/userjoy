angular
    .module('models.Invite', ['services'])
    .service('InviteModel', ['$http', 'config', '$location', 'AuthService',
        'InviteIdService',
        function ($http, config, $location, AuthService, InviteIdService) {
            this.registerInvitedMember = function (email, password, name,
                inviteId) {
                var data = {
                    email: email,
                    name: name,
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

            this.getPendingInvites = function (appId, cb) {
                $http.get(config.apiUrl + '/apps/' + appId + '/invites')
                    .success(function (data) {
                        console.log("success: ", data);
                        InviteIdService.setInvitedMembers(data);
                        cb()
                    })
                    .error(cb);
            }

            return this;
        }
    ])