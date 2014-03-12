
var qunitPort = Math.floor(Math.random()*(25000-20000+1)+20000);

module.exports = function (grunt) {

	grunt.config('qunit', {
		all: {
			options: {
				timeout: 10000,
				urls: [
					'http://localhost:' + qunitPort + '/qunit'
				]
			}
		}
	});

	grunt.config('express', {
		server: {
			options: {
				port: 8000,
				host: 'localhost',
				script: './site.js',
				background: true
			}
		},
		qunit: {
			options: {
				port: qunitPort,
				host: 'localhost',
				script: './qunit-tester.js',
				background: true
			}
		}
	});

	grunt.loadNpmTasks('grunt-express-server');
	grunt.loadNpmTasks('grunt-contrib-qunit');
};
