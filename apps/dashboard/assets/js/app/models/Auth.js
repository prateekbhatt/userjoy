angular.module('models.auth', ['services'])

.service('AuthService', function ($http, utils) {

    var userIsAuthenticated = false;

    this.setUserAuthenticated = function (value) {
        userIsAuthenticated = value;
    };

    this.getUserAuthenticated = function () {
        return userIsAuthenticated;
    };

    return this;

});