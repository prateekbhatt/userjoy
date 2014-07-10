
// development
window.userjoy=window.userjoy||[],window.userjoy.methods=["identify","company","track","page","track_link","track_form"],window.userjoy.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);return t.unshift(e),window.userjoy.push(t),window.userjoy}};for(var i=0;i<window.userjoy.methods.length;i++){var key=window.userjoy.methods[i];window.userjoy[key]=window.userjoy.factory(key)}window.userjoy.load=function(e){if(!document.getElementById("userjoy-client-js")){window._userjoy_id=e;var t=document.createElement("script");t.type="text/javascript",t.id="userjoy-client-js",t.async=!0,t.src=("https:"===document.location.protocol?"https:":"http:")+"//cdn.do.localhost/build/userjoy-dev.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n)}};

// production
//

<script type="text/javascript">

  window.userjoy=window.userjoy||[],window.userjoy.methods=["identify","company","track","page","track_link","track_form"],window.userjoy.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);return t.unshift(e),window.userjoy.push(t),window.userjoy}};for(var i=0;i<window.userjoy.methods.length;i++){var key=window.userjoy.methods[i];window.userjoy[key]=window.userjoy.factory(key)}window.userjoy.load=function(e){if(!document.getElementById("userjoy-client-js")){window._userjoy_id=e;var t=document.createElement("script");t.type="text/javascript",t.id="userjoy-client-js",t.async=!0,t.src=("https:"===document.location.protocol?"https:":"http:")+"//d1jozu9mugm1h5.cloudfront.net/js/userjoy.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n)}};


  userjoy.load('53bab67e1be0e59955e061f1');

  userjoy.identify({

    // TODO: logged in user's email.
    // Used to identify the user and send him email messages
    // (REQUIRED)
    email: 'test@userjoy.co',

    // TODO: logged in user's unique id.
    // if your app allows a user to change his email address,
    // then user_id is required to identify user
    // (OPTIONAL)
    user_id: '758439753849',

    // TODO: logged in user's payment status
    // MUST be one of 'trial' / 'free' / 'paying' / 'cancelled'
    // (REQUIRED)
    status: 'trial',

    // TODO: logged in user's sign-up date in UNIX timestamp
    // (milliseconds after epoch)
    // (REQUIRED)
    joined: 1403353187345,

    // TODO: logged in user's subscription plan
    // Helps you segment users by plan name
    // (OPTIONAL)
    plan: 'Enterprise',

    // TODO: monthly revenue from user
    // (OPTIONAL)
    revenue: 499

  });
</script>
