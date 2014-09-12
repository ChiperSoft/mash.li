
module.exports = function (grunt) {

	grunt.config('jshint', {
		options: {
			jshintrc: '.jshintrc',
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

			'!public/assets/js/require.config.js'
		],

	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
};
