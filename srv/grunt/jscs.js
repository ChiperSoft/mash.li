
module.exports = function (grunt) {

	grunt.config('jscs', {
		options: {
			config: '.jscsrc',
		},
		all: [
			'Gruntfile.js',
			'app/**/*.js',
			'!app/**/*.hbs.js',

			'public/assets/components/**/*.js',
			'public/assets/models/**/*.js',
			'public/assets/collections/**/*.js',
			'public/assets/js/**/*.js',
			'!public/assets/**/*.hbs.js',  //ignore compiled handlebars templates
		],

	});

	grunt.loadNpmTasks('grunt-jscs-checker');
};
