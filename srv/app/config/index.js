// This file is an example config file that the app will fallback to if the
// real file does not exist at app/config.js.  To deploy the site you must
// copy this file to app/config.js and apply the environment level options

module.exports = {
	soundcloudKey: 'DOMAIN_KEY',
	sessions: {
		secret: 'secret',
		cookieKey: 'session'
	},
	redis: {
		host: '127.0.0.1',
		port: 6379,
		pass: false
	},
	mongodb: 'mongodb://localhost/main',
	addPerDay: 10
};