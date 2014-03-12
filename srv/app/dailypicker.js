
var when = require('when');
var proxmis = require('proxmis');

var config = require('app/config');
var log = require('app/log');

var Track = require('app/models/Track');
var SCTrack = require('app/models/SoundCloudTrack');

module.exports = function (callback) {

	proxmis.wrap(function (cb) { SCTrack.find().select('_id').exec(cb); }).then(function (ids) {
		ids = ids
			.map(function (o) { return Number(o._id); })
			.sort(function() {return 0.5 - Math.random();})
			.slice(0, config.addPerDay);

		return proxmis.wrap(function (cb) { SCTrack.find({ _id: {$in: ids}}, cb); });
	}).then(function (tracks) {
		var defers = tracks.map(function (track) {
			var p = proxmis();
			var t = new Track();
			t._id = track.id;
			t.details = track.id;
			t.save(function (err) {
				if (err) {console.warn(p);return p(err);}
				SCTrack.update({_id:t._id}, {trackLink: t._id}, p);

				log({
					level: 6,
					name: 'Added New Track',
					status: track.title
				});
			});

			return p;
		});

		when.all(defers).then(function () {
			callback();
		});
	});

};