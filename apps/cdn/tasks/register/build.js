module.exports = function (grunt) {
	grunt.registerTask('build', [
    'replace:production',
    'uglify'
	]);
};
