
module.exports = function (grunt) {

	grunt.config('nodeunit', {

		all: ['tests/**/*_test.js']

	});

	grunt.loadNpmTasks('grunt-contrib-nodeunit');
};
