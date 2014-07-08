module.exports = function (grunt) {
	grunt.registerTask('buildProd', [
		'compileAssets',
		'concat',
		'uglify',
		'cssmin',
    'filerev',
		'linkAssetsBuildProd',
		'clean:build',
		'copy:build'
	]);
};
