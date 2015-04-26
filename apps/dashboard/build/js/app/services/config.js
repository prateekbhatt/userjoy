angular.module('services.config', [])

.service('config', function () {

  // private vars here if needed
  //
  // CHECK: REPLACE THE FOLLOWING WITH YOUR CONFIG BEFORE RUNNING
  //
  if(window.location.pathname == '/demo') {
    return {
      siteName: 'DoDataDo',
      // no trailing slash!
      siteUrl: '/',
      apiUrl: 'https://demo.userjoy.co',
      cookieDomain: '.userjoy.co',
      currentUser: false
    };
  }
  if (window.location.href.split("/")[2] == 'app.do.localhost') {
    return {
      siteName: 'DoDataDo',
      // no trailing slash!
      siteUrl: '/',
      apiUrl: 'http://api.do.localhost',
      cookieDomain: '.do.localhost',
      currentUser: false
    };

  } else {
    return {
      siteName: 'DoDataDo',
      // no trailing slash!
      siteUrl: '/',
      apiUrl: 'https://api.userjoy.co',
      cookieDomain: '.userjoy.co',

      currentUser: false
    };
  }

});
