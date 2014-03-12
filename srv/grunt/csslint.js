
module.exports = function (grunt) {

	grunt.config('csslint', {
		components: {
			src: [
				'public/assets/css/all-components.css',
				'public/assets/css/pages/**/*.css'
			],
			options: {
				csslintrc: '.csslintrc'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-csslint');
};
