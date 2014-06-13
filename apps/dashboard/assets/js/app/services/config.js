angular.module('services.config', [])

.service('config', function () {

  // private vars here if needed

  return {
    siteName: 'DoDataDo',
    // no trailing slash!
    siteUrl: '/',
    apiUrl: 'http://api.do.localhost',

    currentUser: false
  };

});