angular
    .module('models.Invite', ['services'])
    .service('InviteModel', ['$http', 'config',
        function ($http, config) {
            this.registerInvitedMember = function (email, password,
                inviteId) {
                var data = {
                    email: email,
                    password: password,
                    inviteId: inviteId
                }
                $http.post(config.apiUrl + '/account', data)
                    .success(function (data) {
                        console.log(
                            "account created for invited member");
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