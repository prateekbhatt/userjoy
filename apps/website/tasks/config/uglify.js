/**
 * Minify files with UglifyJS.
 *
 * ---------------------------------------------------------------
 *
 * Minifies client-side javascript `assets`.
 *
 * For usage docs see:
 *    https://github.com/gruntjs/grunt-contrib-uglify
 *
 */
module.exports = function (grunt) {

  grunt.config.set('uglify', {
    options: {
      compress: {
        drop_console: true
      }
    },
    dist: {
      src: ['.tmp/public/concat/production.js'],
      dest: '.tmp/public/min/production.js'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
};