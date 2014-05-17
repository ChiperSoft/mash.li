
var when = require('when');
var proxmis = require('proxmis');

var config = require('app/config');
var log = require('app/log');

var Track = require('app/models/Track');
var SCTrack = require('app/models/SoundCloudTrack');
var promiseFromSoundcloudCache = require('app/lib/soundcloud-cache');

module.exports = function (callback) {

	proxmis.wrap(function (cb) { SCTrack.find({trackLink: null}).select('_id').exec(cb); }).then(function (ids) {
		log({
			level: 6,
			name: 'Loaded Unadded tracks',
			status: ids.length
		});

		ids = ids
			.map(function (o) { return String(o._id); })     //extract ids
			.sort(function () {return 0.5 - Math.random();}) // shuffle
			.slice(0, config.addPerDay * 5)                      // reduce to 100
			.map(promiseFromSoundcloudCache);

		log({
			level: 6,
			name: 'Requesting Details from Soundcloud',
			status: ids.length
		});

		return when.all(ids);

	}).then(function (tracks) {

		log({
			level: 6,
			name: 'Tracks Loaded',
			status: tracks.length
		});

		tracks = tracks
			.filter(Boolean)
			.sort(function (a,b) {
				return Track.pressure(b) - Track.pressure(a);
			})
			.slice(0, config.addPerDay)
			.map(function (sctrack) {
				var p = proxmis();
				var t = new Track();
				t._id = sctrack.id;
				t.details = sctrack;
				t.save(function (err) {
					if (err) {console.log(err);return p(err);}
					SCTrack.update({_id: t._id}, {trackLink: t._id}, p);

					log({
						level: 6,
						name: 'Added New Track',
						status: sctrack.title,
						target: Track.pressure(sctrack)
					});
				});

				return p;
			});

		return when.all(tracks);

	}).then(function () {
		callback();
	}, function (err) {
		callback(err);
	});

};
