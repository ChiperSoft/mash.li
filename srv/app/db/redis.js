
var config = require('app/config');

var log = require('app/log');

//initialize redis connection
var redis = require('redis').createClient(config.redis.port, config.redis.host);

if (config.redis.pass) {
	redis.auth(config.redis.pass);
}

redis.on("error", function (err) {
	log({
		level: 1,
		name: 'general error',
		source: 'redis',
		error: err
	});
});

redis.once('connect', function () {
	log({
		level: 10,
		name: 'DB Connected',
		source: 'redis'
	});
});

process.on('graceful stop', function (promises) {
	var p = require('proxmis')();
	promises.push(p);

	redis.close(p);
});

module.exports = redis;
