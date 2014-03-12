var Setting = require('app/models/Setting');
var log = require('app/log');

module.exports = function (callback) {

	var reader = new (require('app/lib/soundcloud-reader'))();
	var writer = require('app/lib/soundcloud-writer');

	Setting.findById('LastSoundCloudSync', function (err, setting) {
		reader.since = setting && new Date(setting.value) || false;

		log({
			level: 6,
			name: 'Requesting new tracks since',
			status: reader.since
		});
		
		reader.pipe(writer);
	});

	writer.on('finish', function () {
		Setting.update({_id:'LastSoundCloudSync'}, {value:Date.now()}, {upsert:true}, function () {
			callback(null);
		});
	});

	writer.on('error', function (err) {
		callback(err);
	});

	reader.on('error', function (err) {
		callback(err);
	});
};