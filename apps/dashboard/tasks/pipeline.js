/**
 * grunt/pipeline.js
 *
 * The order in which your css, javascript, and template files should be
 * compiled and linked from your views and static HTML files.
 *
 * (Note that you can take advantage of Grunt-style wildcard/glob/splat expressions
 * for matching multiple files.)
 */



// CSS files to inject in order
//
// (if you're using LESS with the built-in default config, you'll want
//  to change `assets/styles/importer.less` instead.)
var cssFilesToInject = [

  // NOTE: put importer.css at top because it consists of bootstrap.css
  'styles/importer.css',

  // NOTE: put required bower dependencies here
  // e.g. 'bower_components/bootstrap/dist/css/bootstrap.css',
  'bower_components/ng-table/ng-table.css',

  'bower_components/font-awesome/css/font-awesome.css',

  'bower_components/angular-motion/dist/angular-motion.min.css',

  'bower_components/nvd3/nv.d3.css',

  // all other styles go below
  'styles/**/*.css'
];


// Client-side javascript files to inject in order
// (uses Grunt-style wildcard/glob/splat expressions)
var jsFilesToInject = [

  // Below, as a demonstration, you'll see the built-in dependencies
  // linked in the proper order order

  //
  // *->    you might put other dependencies like jQuery or Angular here   <-*
  //
  'bower_components/angular/angular.js',
  'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
  'bower_components/angular-ui-router/release/angular-ui-router.js',
  'bower_components/angular-ui-utils/modules/route/route.js',
  'bower_components/moment/moment.js',
  'bower_components/angular-moment/angular-moment.js',
  'bower_components/lodash/dist/lodash.js',
  'bower_components/angular-lodash/angular-lodash.js',
  'bower_components/ng-table/ng-table.js',
  'bower_components/angular-strap/dist/angular-strap.min.js',
  'bower_components/angular-strap/dist/angular-strap.tpl.min.js',
  'bower_components/angular-animate/angular-animate.js',
  'bower_components/angular-sanitize/angular-sanitize.min.js',
  'bower_components/textAngular/textAngular.js',
  'bower_components/d3/d3.min.js',
  'bower_components/nvd3/nv.d3.js',
  'bower_components/angularjs-nvd3-directives/dist/angularjs-nvd3-directives.js',
  'bower_components/angular-cookie/angular-cookie.js',
  // 'bower_components/textAngular/textAngular-sanitize.js',
  // 'js/app/textAng.js',

  // Bring in the socket.io client
  // 'js/sockets/socket.io.js',
  // 'bower_components/socket.io-client/dist/socket.io.min.js',

  // then beef it up with some convenience logic for talking to Sails.js
  // 'js/sockets/sails.io.js',
  // 'bower_components/angular-sails/angular-sails.js',
  // 'bower_components/bower-sails.io/sails.io.js',

  // finally, include a simple boilerplate script that connects a socket
  // to the Sails backend with some example code
  // 'js/sockets/connection.example.js',


  // All of the rest of your app scripts
  'js/**/*.js'
];


// Client-side HTML templates are injected using the sources below
// The ordering of these templates shouldn't matter.
// (uses Grunt-style wildcard/glob/splat expressions)
//
// By default, Sails uses JST templates and precompiles them into
// functions for you.  If you want to use jade, handlebars, dust, etc.,
// with the linker, no problem-- you'll just want to make sure the precompiled
// templates get spit out to the same file.  Be sure and check out `tasks/README.md`
// for information on customizing and installing new tasks.
var templateFilesToInject = [
  'templates/**/*.html'
];








// Prefix relative paths to source files so they point to the proper locations
// (i.e. where the other Grunt tasks spit them out, or in some cases, where
// they reside in the first place)
module.exports.cssFilesToInject = cssFilesToInject.map(function (path) {
  return '.tmp/public/' + path;
});
module.exports.jsFilesToInject = jsFilesToInject.map(function (path) {
  return '.tmp/public/' + path;
});
module.exports.templateFilesToInject = templateFilesToInject.map(function (
  path) {
  return 'assets/' + path;
});
