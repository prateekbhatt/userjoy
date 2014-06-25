/**
 * Send files to S3.
 *
 * ---------------------------------------------------------------
 *
 * Pushes files to AWS S3
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
    production: {
      files: [{
        src: ['**/*'],
        dest: ''
      }]
    }
  });

  grunt.loadNpmTasks('grunt-invalidate-cloudfront');
};
