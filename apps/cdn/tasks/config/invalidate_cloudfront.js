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
      key: 'YOUR_AWS_KEY',
      secret: 'YOUR_AWS_SECRET',
      distribution: 'YOUR_AWS_CLOUDFRONT_DISTRIBUTION_ID'
    },
    dist: {
      files: [{
        dest: 'js/userjoy.js'
      }]
    }
  });

  grunt.loadNpmTasks('grunt-invalidate-cloudfront');
};
