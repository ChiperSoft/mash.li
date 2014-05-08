var _ = require('lodash');
var request = require('request');
var config = require('app/config');

var cache = require('app/lib/request-buffer')({
	ttl: 1000 * 60 * 60 * 6,
	limit: 50,
	autoRefetch: true,
	processor: function (ids, resolve, reject, rejectAll, done) {
		var url = 'https://api.soundcloud.com/tracks.json?client_id=' + config.soundcloudKey + '&ids=' + ids.join(',');

		request.get(url, {json: true}, function (err, response, tracks) {
			if (err) {
				return rejectAll(err);
			}

			_.each(tracks, function (track) {

				// parse the tags list into something usable
				track.tags = track.tag_list && getTags(track.tag_list) || track.tags || [];

				// convert the artwork url to the largest size we need (for the songbar)
				if (track.artwork_url) {
					track.artwork_url = track.artwork_url.replace('-large', '-t300x300');
				}

				resolve(track.id, track);
			});

			done();
		});
	}
});

module.exports = cache.get;

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

