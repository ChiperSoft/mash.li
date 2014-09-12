
module.exports = function (grunt) {

	grunt.config('express', {
		server: {
			options: {
				port: 8000,
				host: 'localhost',
				script: './server.js',
				background: true
			}
		}
	});

	grunt.loadNpmTasks('grunt-express-server');
};
