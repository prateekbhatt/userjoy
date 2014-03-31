"use strict";

(function (window, document, console) {

  var _dodatado = {


    $: null,
    events: {},
    jquery_loaded: false,

    // configuration handler for setting up variables for development and
    // production environments
    ConfigHandler: {

      // configuration variables for development and production environments
      Config: {

        // removed "Local" environment because it causes problems with other
        // clients' test servers
        // DO NOT test with localhost or 127.0.0.1 because it creates confusion
        // in others implementation
        LocalWithDomain: {
          jsonp_url: 'http://local.host:3000/events/new',
          cookie_domain: '.local.host'
        },

        Production: {
          jsonp_url: 'http://dodatado.com/events/new',
          cookie_domain: '.dodatado.com'
        }
      },

      getValue: function (key) {
        var env = this.getEnv();
        return this.Config[env][key];
      },

      getEnv: function () {
        var env;

        switch (window.location.hostname) {
        case "local.host":
          env = "LocalWithDomain";
          break;
        default:
          env = 'Production';
        }

        return env;
      }
    },

    // check if jquery is loaded, if not then load jquery, and then call main
    // function
    loadJquery: function () {
      var _do = this,
        script_tag;

      if (window.jQuery === undefined || parseFloat(window.jQuery.fn.jquery) <
        1.9) {
        script_tag = document.createElement("script");
        script_tag.setAttribute("type", "text/javascript");
        script_tag.setAttribute("src",
          "//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js");
        script_tag.onload = function () {
          _do.$ = window.jQuery.noConflict(true);
          _do.$(document)
            .ready(function () {
              _do.log(_do.checkJquery() ? 'jQuery loaded' :
                'jQuery not loaded');
              _do.main.call(_do)
            })
        };

        script_tag.onreadystatechange = function () {
          if (this.readyState === "complete" || this.readyState === "loaded") {
            _do.$ = window.jQuery.noConflict(true);
            _do.$(document)
              .ready(function () {
                _do.log(_do.checkJquery() ? 'jQuery loaded' :
                  'jQuery not loaded');
                _do.main.call(_do)
              })
          }
        };
        (document.getElementsByTagName("head")[0] || document.documentElement)
          .appendChild(script_tag)
      } else {
        _do.jquery_loaded = true;
        _do.$ = window.jQuery;
        _do.$(document)
          .ready(function () {
            _do.log(_do.checkJquery() ? 'jQuery loaded by default' :
              'jQuery NOT loaded');
            _do.main.call(_do)
          })
      }
    },

    checkJquery: function () {
      return (typeof this.$ === 'function');
    },

    main: function () {
      var _do = this,
        $ = _do.$;

      _do.getMessage();
    },

    getMessage: function () {
      var _do = this,
        $ = _do.$,
        Event = _do.EventHandler;

      _do.log('inside getMessage');

      var data = {
        app_id: Event.getAppId(),
        visit_id: Event.getVisitId.call(_do),
        user_id: Event.getUserId.call(_do),

        referrer: Event.getReferrer(),
        host: Event.getHost(),
        hostname: Event.getHostname(),
        pathname: Event.getPathname(),

        query: Event.getQueryParams(),
        title: Event.getPageTitle(),
        platform: Event.getPlatform()
      };

      $.ajaxSetup({
        cache: false
      });

      $.ajax({
        url: _do.ConfigHandler.getValue('jsonp_url'),
        data: data,
        dataType: "jsonp",
        jsonpCallback: "doCallback",
        timeout: 2500,

        success: function (data) {

          _do.log("render response received");
          var cookie_domain = _do.ConfigHandler.getValue("cookie_domain");
          if (data) {
            console.log(data);

            // set userId cookie for 2 years (17520 hours)
            _do.CookieHandler.set('do.uid', data['uid'], 17520, '/',
              cookie_domain);

            // set visitId cookie for 30 minutes (0.5 hours)
            _do.CookieHandler.set('do.vid', data['vid'], 0.5, '/',
              cookie_domain);
          }
        },
        error: function (XHR, textStatus, errorThrown) {
          _do.log("dodatado error: " + textStatus);
        }
      });
    },

    log: function (msg) {
      if (this.ConfigHandler.getEnv() != "Production") {
        console.log(new Date()
          .valueOf() + ": " + msg);
      }
    },

    EventHandler: {

      getAppId: function () {
        return window['dodatado_ID'];
      },

      getUserId: function () {
        return this.CookieHandler.get('do.uid');
      },

      getVisitId: function () {
        return this.CookieHandler.get('do.vid');
      },

      getReferrer: function () {
        return encodeURIComponent(document.referrer);
      },

      getHost: function () {
        return encodeURIComponent(window.location.host);
      },

      getHostname: function () {
        return encodeURIComponent(window.location.hostname);
      },

      getPathname: function () {
        return encodeURIComponent(window.location.pathname);
      },

      getPageTitle: function () {
        return document.title;
      },

      getPlatform: function () {
        return window.navigator.platform;
      },

      getQueryParams: function () {
        return encodeURIComponent(location.search);
      },

      getQueryParameterByName: function (name) {
        name = name.replace(/[\[]/, "\\\[")
          .replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
          results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(
          /\+/g, " "));
      }
    },

    CookieHandler: {
      get: function (key) {
        var tmp = document.cookie.match((new RegExp(key + "=[^;]+($|;)",
          "gi")));
        return (!tmp || !tmp[0]) ? null : unescape(tmp[0].substring(key.length +
            1, tmp[0].length)
          .replace(";", "")) || null
      },
      set: function (key, value, ttl, path, domain, secure) {
        var cookie = [key + "=" + escape(value), "path=" + ((!path || path ===
          "") ? "/" : path), "domain=" + ((!domain || domain === "") ? "" :
          domain)];
        if (ttl) {
          cookie.push("expires=" + this.hoursToExpireDate(ttl))
        }
        if (secure) {
          cookie.push("secure")
        }
        document.cookie = cookie.join("; ");
        return document.cookie
      },
      unset: function (key, path, domain) {
        path = (!path || typeof path !== "string") ? "" : path;
        domain = (!domain || typeof domain !== "string") ? "" : domain;
        if (this.get(key)) {
          this.set(key, "", "Thu, 01-Jan-70 00:00:01 GMT", path, domain)
        }
      },
      hoursToExpireDate: function (ttl) {
        if (isNaN(+ttl)) {
          return ""
        } else {
          var now = new Date();
          now.setTime(now.getTime() + (+ttl * 60 * 60 * 1000));
          return now.toGMTString()
        }
      }
    }

  }

  // run loadJquery to initiate function
  _dodatado.loadJquery();

})(window, document, console);
