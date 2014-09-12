
module.exports = function (grunt) {

	grunt.config('copy', {
		rjsmodules: {
			files: [
				{expand: true, cwd: 'public/assets/modules', src: ['*.js', '!main.js'], dest: 'public/assets/rjs/', filter: 'isFile'},
			]
		},

		frontend: {
			files: [
				{
					expand: true,
					cwd: 'node_modules',
					src: [
						'backbone',
						'bootstrap',
						'es5-shim',
						'handlebars',
						'html5shiv',
						'jquery',
						'moment',
						'pinvault',
						'pinvault-observer',
						'requirejs',
						'SoundManager',
						'when'
					].map(function (s) {return s + '/**';}),
					dest: 'public/assets/vendor/'
				},
			]
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
};
