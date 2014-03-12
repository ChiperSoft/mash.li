
/**
 * GRUNT CONFIGURATION
 */
module.exports = function(grunt) {

	grunt.loadTasks('grunt');

	grunt.registerTask('test', [
		// 'nodeunit',
		// 'express:qunit',
		// 'qunit'
	]);

	grunt.registerTask('launch', [
		'less',
		'handlebars',
		'requirejs:main',
		'copy:rjsmodules',
		'express:server',
		'watch'
	]);

	grunt.registerTask('lint', [
		'jshint',
		'less',
		'csslint'
	]);

	grunt.registerTask('deploy', [
		'less',
		'cssmin',
		'handlebars',
		'lodash',
		'requirejs'
	]);

	grunt.registerTask('default', [
		'jshint',
		'less',
		'csslint',
		'cssmin',
		'handlebars',
		'lodash',
		'test',
		'requirejs'
	]);

};

