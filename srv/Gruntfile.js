
/**
 * GRUNT CONFIGURATION
 */
module.exports = function (grunt) {

	grunt.loadTasks('grunt');

	grunt.registerTask('launch', [
		'development',
		'run'
	]);

	grunt.registerTask('run', [
		'express:server',
		'watch'
	]);

	grunt.registerTask('lint', [
		'jshint',
		'jscs',
		'less',
		'csslint'
	]);

	grunt.registerTask('production', [
		'copy:frontend',
		'less',
		'cssmin',
		'handlebars',
		'lodash',
		'concat:helpers',
		'amdwrap:helpers',
		'requirejs'
	]);

	grunt.registerTask('development', [
		'copy:frontend',
		'less',
		'handlebars',
		'lodash',
		'concat:helpers',
		'amdwrap:helpers',
		'requirejs:main',
		'copy:rjsmodules',
	]);

	grunt.registerTask('default', [
		'jshint',
		'jscs',
		'copy:frontend',
		'less',
		'csslint',
		'handlebars',
		'lodash',
		'concat:helpers',
		'amdwrap:helpers',
		'requirejs:main',
		'copy:rjsmodules',
	]);

};

