/**
 * Send files to S3.
 *
 * ---------------------------------------------------------------
 *
 * Pushes files to AWS S3
 *
 * For usage docs see:
 *    https://github.com/pifantastic/grunt-s3
 *
 */
module.exports = function (grunt) {

  var config = require('../../../config')('api');

  grunt.config.set('s3', {

    // TODO: aws keys should be defined in the config file
    options: {
      key: config.awsKey,
      secret: config.awsSecret,
      bucket: config.awsS3CDNBucket,
      access: 'public-read',
      gzip: true
    },
    js: {
      upload: [{
        src: './build/userjoy-prod.js',
        dest: 'js/userjoy.js'
      }]
    }
  });

  grunt.loadNpmTasks('grunt-s3');
};
