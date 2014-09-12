
/**
 * GRUNT CONFIGURATION
 */
module.exports = function (grunt) {

	grunt.loadTasks('grunt');

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

	grunt.registerTask('deploy', [
		'less',
		'cssmin',
		'copy:frontend',
		'handlebars',
		'lodash',
		'concat:helpers',
		'amdwrap:helpers',
		'requirejs'
	]);

	grunt.registerTask('default', [
		'jshint',
		'jscs',
		'copy:frontend',
		'less',
		'csslint',
		'cssmin',
		'handlebars',
		'lodash',
		'concat',
		'amdwrap',
		'requirejs'
	]);

};

