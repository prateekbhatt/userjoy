module.exports = function (grunt) {
	grunt.registerTask('linkAssetsBuildProd', [
		'sails-linker:prodJs',
		'sails-linker:prodStyles',
		'sails-linker:prodTpl'
	]);
};
