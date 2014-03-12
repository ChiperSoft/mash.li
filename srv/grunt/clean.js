
module.exports = function (grunt) {

	grunt.config('clean', {
		built: {
			src: [
				'**/*.hbs.js',
				'public/assets/rjs',
				'public/assets/css'
			]
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
};
