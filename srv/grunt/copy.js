
module.exports = function (grunt) {

	grunt.config('copy', {
		rjsmodules: {
			files: [
				{expand: true, cwd: 'public/assets/modules', src: ['*.js', '!main.js'], dest: 'public/assets/rjs/', filter: 'isFile'},
			]
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
};
