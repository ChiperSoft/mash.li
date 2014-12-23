
var config = require('app/config');

var log = require('app/log');

var mongoose = require('mongoose');

mongoose.connect(config.mongodb, {
	server: {
		keepAlive: 1
	}
});

var db = mongoose.connection;

db.on("error", function (err) {
	log({
		level: 1,
		name: 'general error',
		source: 'mongodb',
		error: err
	});
});

db.once('open', function () {
	log({
		level: 10,
		name: 'DB Connected',
		source: 'mongodb'
	});
});

process.on('graceful stop', function (promises) {
	var p = require('proxmis')();
	promises.push(p);

	mongoose.disconnect(p);
});

module.exports = mongoose;
