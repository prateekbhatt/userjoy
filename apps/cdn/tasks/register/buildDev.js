module.exports = function (grunt) {
	grunt.registerTask('buildDev', [
    'replace:dev',
    'uglify:dev'
	]);
};
