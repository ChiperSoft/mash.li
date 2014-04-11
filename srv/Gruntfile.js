
/**
 * GRUNT CONFIGURATION
 */
module.exports = function (grunt) {

	grunt.loadTasks('grunt');

	grunt.registerTask('test', [
		// 'nodeunit',
		// 'express:qunit',
		// 'qunit'
	]);

	grunt.registerTask('launch', [
		'less',
		'handlebars',
		'concat:helpers',
		'amdwrap:helpers',
		'requirejs:main',
		'copy:rjsmodules',
		'express:server',
		'watch'
	]);

	grunt.registerTask('lint', [
		'jshint',
		'jscs',
		'less',
		'csslint'
	]);

	grunt.registerTask('deploy', [
		'less',
		'cssmin',
		'handlebars',
		'lodash',
		'concat:helpers',
		'amdwrap:helpers',
		'requirejs'
	]);

	grunt.registerTask('default', [
		'jshint',
		'jscs',
		'less',
		'csslint',
		'cssmin',
		'handlebars',
		'lodash',
		'test',
		'concat',
		'amdwrap',
		'requirejs'
	]);

};

