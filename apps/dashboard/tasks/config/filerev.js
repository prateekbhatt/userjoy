/**
 * Static asset revisioning through file content hash
 *
 * ---------------------------------------------------------------
 *
 * Renames static assets to overcome caching issues
 *
 * For usage docs see:
 *    https://github.com/yeoman/grunt-filerev
 *
 */
module.exports = function (grunt) {

  grunt.config.set('filerev', {
    options: {
      encoding: 'utf8',
      algorithm: 'md5',
      length: 8
    },
    // devJs: {
    //   src: ['.tmp/public/concat/production.js'],
    // },
    // devCss: {
    //   src: ['.tmp/public/concat/production.css']
    // },
    prodJs: {
      src: '.tmp/public/min/production.js'
    },
    prodCss: {
      src: '.tmp/public/min/production.css'
    },
    prodJst: {
      src: '.tmp/public/jst.js'
    }
  });

  grunt.loadNpmTasks('grunt-filerev');
};