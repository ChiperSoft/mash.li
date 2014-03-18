
module.exports = function (grunt) {

	grunt.config('csslint', {
		components: {
			src: [
				'public/assets/css/all-components.css'
			],
			options: {
				csslintrc: '.csslintrc'
			}
		},
		components: {
			src: [
				'public/assets/css/pages/**/*.css'
			],
			options: {
				csslintrc: '.csslintrc-pages'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-csslint');
};
