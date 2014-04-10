angular
    .module('models.apps', ['services'])
    .service('AppModel', ['$http', 'config',
        function ($http, config) {

            this.get = function (cb) {

                $http
                    .get(config.apiUrl + '/apps')
                    .success(function (data) {
                        cb(null, data);
                    })
                    .error(cb);

            };


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
        }
    ])