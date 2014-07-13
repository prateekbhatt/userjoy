module.exports = function (grunt) {
  grunt.registerTask('prod', [
    'clean:prod',
    'copy:prod',
    'linkAssetsBuildProd'
  ]);
};
