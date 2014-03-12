
module.exports = function (grunt) {

	grunt.config('handlebars', {
		frontend: {
			options: {
				namespace: false,
				nodePassIn: true
			},
			files: [{
				expand: true,
				cwd: 'public/assets/',
				src: [
					'components/**/*.hbs.html'
				],
				dest: 'public/assets/',
				ext: '.hbs.js'
			}]
		},


		backend: {
			options: {
				namespace: false,
				nodePassIn: true
			},
			files: [{
				expand: true,
				cwd: 'views/',
				src: [
					'**/*.hbs.html',
				],
				dest: 'views/',
				ext: '.hbs.js'
			}]
		},

		backendComponents: {
			options: {
				namespace: false,
				nodePassIn: true
			},
			files: [{
				expand: true,
				cwd: 'app/components/',
				src: [
					'**/*.hbs.html',
				],
				dest: 'app/components/',
				ext: '.hbs.js'
			}]
		}
	});

	grunt.loadNpmTasks('grunt-handlebars-universal');
};
