
// development
window.userjoy=window.userjoy||[],window.userjoy.methods=["identify","company","track","page","track_link","track_form"],window.userjoy.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);return t.unshift(e),window.userjoy.push(t),window.userjoy}};for(var i=0;i<window.userjoy.methods.length;i++){var key=window.userjoy.methods[i];window.userjoy[key]=window.userjoy.factory(key)}window.userjoy.load=function(e){if(!document.getElementById("userjoy-js")){window._userjoy_id=e;var t=document.createElement("script");t.type="text/javascript",t.id="userjoy-js",t.async=!0,t.src=("https:"===document.location.protocol?"https:":"http:")+"//cdn.do.localhost/build/userjoy-dev.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n)}};

// production
window.userjoy=window.userjoy||[],window.userjoy.methods=["identify","company","track","page","track_link","track_form"],window.userjoy.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);return t.unshift(e),window.userjoy.push(t),window.userjoy}};for(var i=0;i<window.userjoy.methods.length;i++){var key=window.userjoy.methods[i];window.userjoy[key]=window.userjoy.factory(key)}window.userjoy.load=function(e){if(!document.getElementById("userjoy-js")){window._userjoy_id=e;var t=document.createElement("script");t.type="text/javascript",t.id="userjoy-js",t.async=!0,t.src=("https:"===document.location.protocol?"https:":"http:")+"//d1jozu9mugm1h5.cloudfront.net/js/userjoy.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n)}};


window.userjoy.load('53bab67e1be0e59955e061f1');
userjoy.identify({
  // TODO: Replace email below with that of the logged in user
  email: 'test@userjoy.co'
});
