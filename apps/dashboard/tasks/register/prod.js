module.exports = function (grunt) {
	grunt.registerTask('prod', [
		'compileAssets',
		'concat',
		'uglify',
		'cssmin',
    'filerev',
		'sails-linker:prodJs',
		'sails-linker:prodStyles',
		'sails-linker:devTpl'
	]);
};
