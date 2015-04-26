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

  var config = require('../../../config')('api');

  grunt.config.set('invalidate_cloudfront', {

    // TODO: aws keys should be defined in the config file
    options: {
      key: config.awsKey,
      secret: config.awsSecret,
      distribution: config.awsCloudfrontDistributionId
    },
    dist: {
      files: [{
        dest: 'js/userjoy.js'
      }]
    }
  });

  grunt.loadNpmTasks('grunt-invalidate-cloudfront');
};
