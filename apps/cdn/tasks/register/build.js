module.exports = function (grunt) {
	grunt.registerTask('build', [
    'replace:prod',
    'uglify:prod'
	]);
};
