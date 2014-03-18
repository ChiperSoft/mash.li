
module.exports = function (grunt) {

	grunt.config('watch', {
		css: {
			files: 'public/**/*.less',
			tasks: ['less']
		},

		handlebars: {
			files: '**/*.hbs.html',
			tasks: ['handlebars']
		},

		requirejs: {
			files: ['public/assets/js/require.config.js', 'public/assets/modules/main.js'],
			tasks: ['requirejs:main']
		},

		express: {
			files:  [ 'app/**/*.js', 'views/**/*.js' ],
			tasks:  [ 'express:server' ],
			options: {
				spawn: false // Without this option specified express won't be reloaded
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
};
