angular.module('services.config', [])

.service('config', function () {

  // private vars here if needed
  if (window.location.href.split("/")[2] == 'app.do.localhost') {
    return {
      siteName: 'DoDataDo',
      // no trailing slash!
      siteUrl: '/',
      apiUrl: 'http://api.do.localhost',

      currentUser: false
    };

  } else {
    return {
      siteName: 'DoDataDo',
      // no trailing slash!
      siteUrl: '/',
      apiUrl: 'http://api.userjoy.co',

      currentUser: false
    };
  }

});