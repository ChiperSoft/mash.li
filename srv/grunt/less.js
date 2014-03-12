
module.exports = function (grunt) {

	grunt.config('less', {
		all: {
			files: [{
				expand: true,
				cwd: 'public/less/',
				src: [
					'main.less',
					'all-components.less',
					'pages/**/*.less'
				],
				ext: '.css',
				dest: 'public/assets/css'
			}]
		}
	});

	grunt.loadNpmTasks('grunt-contrib-less');
};
