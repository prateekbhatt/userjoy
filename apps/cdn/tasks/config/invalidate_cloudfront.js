/**
 * Invalidates cloudfront distribution
 *
 * ---------------------------------------------------------------
 *
 * Used to update the userjoy.js client library on cloudfront
 *
 * For usage docs see:
 *    https://github.com/mllrsohn/grunt-invalidate-cloudfront
 *
 */
module.exports = function (grunt) {

  grunt.config.set('invalidate_cloudfront', {

    // TODO: aws keys should be defined in the config file
    options: {
      key: 'AKIAJXDABXAES5XLTTTA',
      secret: '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',
      distribution: 'E372W13ZUERWMY'
    },
    dist: {
      files: [{
        dest: 'js/userjoy.js'
      }]
    }
  });

  grunt.loadNpmTasks('grunt-invalidate-cloudfront');
};
