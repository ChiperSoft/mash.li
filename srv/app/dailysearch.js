var SoundCloudTrack = require('app/models/SoundCloudTrack');
var log = require('app/log');

module.exports = function (callback) {

	var reader = new (require('app/lib/soundcloud-reader'))();
	var writer = require('app/lib/soundcloud-writer');

	SoundCloudTrack.find()
		.sort('-created_at')
		.select('created_at')
		.limit(1)
		.exec(function (err, results) {
			reader.since = results.length && results[0] && new Date(results[0].created_at) || false;

			log({
				level: 6,
				name: 'Requesting new tracks since',
				status: reader.since
			});
			
			reader.pipe(writer);
		});

	writer.on('finish', function () {
		callback(null);
	});

	writer.on('error', function (err) {
		callback(err);
	});

	reader.on('error', function (err) {
		callback(err);
	});
};