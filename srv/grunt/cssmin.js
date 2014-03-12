
module.exports = function (grunt) {

	grunt.config('cssmin', {
		options: {
			keepSpecialComments: 0
		},
		all: {
			expand: true,
			cwd: 'public/assets/css/',
			src: ['**/*.css'],
			dest: 'public/assets/css/'
		}
	});

	grunt.loadNpmTasks('grunt-contrib-cssmin');
};
