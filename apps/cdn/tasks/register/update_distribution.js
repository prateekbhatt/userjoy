/**
 * Build and push userjoy.js to s3 and invalidate cloudfront
 */

module.exports = function (grunt) {
	grunt.registerTask('update_distribution', [
    'build',
    's3',
    'invalidate_cloudfront',
	]);
};
