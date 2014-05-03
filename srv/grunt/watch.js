
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

		helpers: {
			files: ['app/helpers/**/*.js', 'grunt/concat.js'],
			tasks: ['concat:helpers', 'amdwrap:helpers']
		},

		lodash: {
			files: ['grunt/lodash.js'],
			tasks: ['lodash']
		},

		requirejs: {
			files: ['public/assets/js/require.config.js', 'public/assets/modules/main.js'],
			tasks: ['requirejs:main']
		},

		copy: {
			files: ['public/assets/modules/**/*.js'],
			tasks: ['copy:rjsmodules']
		},

		express: {
			files:  [ 'site.js', 'app/**/*.js', 'app/views/**/*.js', 'node_modules/mashli-helpers.js' ],
			tasks:  [ 'express:server' ],
			options: {
				spawn: false // Without this option specified express won't be reloaded
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
};
