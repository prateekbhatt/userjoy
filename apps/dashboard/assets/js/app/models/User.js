angular.module('models.user', ['services'])

.service('UserModel', function ($q, $http, utils) {
    this.getAll = function () {
        var deferred = $q.defer();
        var url = utils.prepareUrl('user');

        $sails.get(url, function (models) {
            return deferred.resolve(models);
        });

        return deferred.promise;
    };

    this.getOne = function (id) {
        var deferred = $q.defer();
        var url = utils.prepareUrl('user/' + id);

        $sails.get(url, function (model) {
            return deferred.resolve(model);
        });

        return deferred.promise;
    };

    this.create = function (newModel) {

        console.log('UserModel create', newModel);

        var deferred = $q.defer();
        var url = utils.prepareUrl('user');

        $http.post(url, newModel, function (model) {
            return deferred.resolve(model);
        });

        return deferred.promise;
    };
});