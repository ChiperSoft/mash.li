var log = require('app/log');
var Writable = require('stream').Writable;

var SoundCloudTrack = require('app/models/SoundCloudTrack');

var stream = new Writable({ objectMode: true });
stream._write = function (track, encoding, next) {
	track.tags = getTags(track.tag_list);
	track.last_scanned_at = Date.now();

	SoundCloudTrack.update({_id: track.id}, track, {upsert: true}, function (err) {
		if (err) {
			log({
				level: 1,
				name: 'ERROR!',
				status: 'SoundCloudTrack',
				target: JSON.stringify(err),
				warn: true
			});
			return next(err);
		}

		log({
			level: 6,
			name: 'Scanned New Song',
			status: track.title,
			target: track.created_at
		});

		next();
	});
};

module.exports = stream;

function getTags (string) {
	var tags = [], tag;
	var regexp = /[^\s"']+|"([^"]*)"/g;
	while (tag = regexp.exec(string)) {
		tag = tag[1] || tag[0];

		// filter the mashup tag, since its implied
		if (tag.toUpperCase() !== 'MASHUP') {
			tags.push(tag);
		}
	}
	return tags;
}
