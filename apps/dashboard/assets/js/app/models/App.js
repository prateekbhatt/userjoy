angular
    .module('models.apps', ['services'])
    .service('AppModel', ['$http', 'config', '$state', 'AppService',
        function ($http, config, $state, AppService) {

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

            this.addNewApp = function (data) {
                $http
                    .post(config.apiUrl + '/apps', data)
                    .success(function (savedApp) {
                        $state.transitionTo('addcode');
                        AppService.new(savedApp);
                        console.log("apps created: ", AppService.getLoggedInApps(),
                            savedApp);
                    })
            }
        }
    ])