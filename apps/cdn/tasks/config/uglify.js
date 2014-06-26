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
      banner: '/*! UserJoy <%= grunt.template.today("dd-mm-yyyy") %> */\n',
      compress: true,
      preserveComments: false,
      report: 'min'
    },
    prod: {
      src: ['./build/userjoy-prod.js'],
      dest: './build/userjoy-prod.js'
    },
    dev: {
      src: ['./build/userjoy-dev.js'],
      dest: './build/userjoy-dev.js'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
};
