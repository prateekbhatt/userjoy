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
    dist: {
      src: ['./userjoy.js'],
      dest: './build/userjoy.js'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
};
