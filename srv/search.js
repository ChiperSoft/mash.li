
var soundcloudSync = require('app/dailysearch');
var mongo = require('app/db/mongo');
var log = require('app/log');

soundcloudSync(function (err) {
	if (err) {
		log({
			level: 1,
			name: 'Search did not finish successfully',
			warn: true
		});
	} else {
		log({
			level: 4,
			name: 'Search complete'
		});
	}

	mongo.disconnect();
});