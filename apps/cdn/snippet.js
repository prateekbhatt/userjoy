// window.userjoy = window.userjoy || [];

// window.userjoy.methods = ['identify', 'company', 'track', 'page', 'track_link',
//   'track_form'
// ];

// window.userjoy.factory = function (method) {
//   return function () {
//     var args = Array.prototype.slice.call(arguments);
//     args.unshift(method);
//     window.userjoy.push(args);
//     return window.userjoy;
//   };
// };

// for (var i = 0; i < window.userjoy.methods.length; i++) {
//   var key = window.userjoy.methods[i];
//   window.userjoy[key] = window.userjoy.factory(key);
// }

// window.userjoy.load = function (key) {
//   if (document.getElementById('userjoy-js')) return;

//   window._userjoy_id = key;
//   var script = document.createElement('script');
//   script.type = 'text/javascript';
//   script.id = 'userjoy-js';
//   script.async = true;

//   script.src = ("https:"===document.location.protocol?"https:":"http:")+"//d1jozu9mugm1h5.cloudfront.net/js/userjoy.js";

//   var first = document.getElementsByTagName('script')[0];
//   first.parentNode.insertBefore(script, first);
// };
//

window.userjoy=window.userjoy||[],window.userjoy.methods=["identify","company","track","page","track_link","track_form"],window.userjoy.factory=function(a){return function(){var b=Array.prototype.slice.call(arguments);return b.unshift(a),window.userjoy.push(b),window.userjoy}};for(var i=0;i<window.userjoy.methods.length;i++){var key=window.userjoy.methods[i];window.userjoy[key]=window.userjoy.factory(key)}window.userjoy.load=function(a){if(!document.getElementById("userjoy-js")){window._userjoy_id=a;var b=document.createElement("script");b.type="text/javascript",b.id="userjoy-js",b.async=!0,b.src=("https:"===document.location.protocol?"https:":"http:")+"//d1jozu9mugm1h5.cloudfront.net/js/userjoy.js";var c=document.getElementsByTagName("script")[0];c.parentNode.insertBefore(b,c)}};

window.userjoy.load('live_8e9dfa442320b8a4508d356044ba5cab');

userjoy.page();

userjoy.identify({
  email: 'prattbhatt@gmail.com'
});
