/**
 * Push userjoy.js to s3 and invalidate cloudfront
 */

module.exports = function (grunt) {
	grunt.registerTask('push', [
    'build',
    's3',
    'invalidate_cloudfront:production',
	]);
};
