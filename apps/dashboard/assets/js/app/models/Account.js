angular
    .module('models.account', ['services'])
    .service('AccountModel', ['$http', 'config',
        function ($http, config) {

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
        }
    ])