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

  grunt.config.set('s3', {

    // TODO: aws keys should be defined in the config file
    options: {
      key: 'AKIAJXDABXAES5XLTTTA',
      secret: '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',
      bucket: 'cdn.userjoy.co',
      access: 'public-read',
      gzip: true
    },
    js: {
      upload: [{
        src: './build/userjoy.js',
        dest: 'js/userjoy.js'
      }]
    }
  });

  grunt.loadNpmTasks('grunt-s3');
};
