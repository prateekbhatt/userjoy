/**
 * Find and replace the API url based on development / production env.
 *
 * from "api.do.localhost" to "api.userjoy.co" for production, and vice-versa
 *
 * ---------------------------------------------------------------
 *
 * For usage docs see:
 *    https://github.com/yoniholmes/grunt-text-replace
 *
 */
module.exports = function (grunt) {
  grunt.config.set('replace', {
    prod: {
      src: ['./userjoy.js'],
      dest: './build/userjoy-prod.js',
      replacements: [{
        from: 'http://api.do.localhost',
        to: 'https://api.userjoy.co'
      }]
    },
    dev: {
      src: ['./userjoy.js'],
      dest: './build/userjoy-dev.js',
      replacements: [{
        from: 'https://api.userjoy.co',
        to: 'http://api.do.localhost'
      }]
    }
  });

  grunt.loadNpmTasks('grunt-text-replace');
};
