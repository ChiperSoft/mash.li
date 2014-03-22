
var proxmis = require('proxmis');
var when = require('when');

var mongoose = require('app/db/mongo');
var Track = require('app/models/Track');

var promiseSoundcloudDetails = require('app/lib/soundcloud-cache');

var sTrackList = mongoose.Schema({
	_id: String,
	details: { type: String, ref: 'SoundCloudTrack' },
	created_at: { type: Date, default: Date.now },
},{
	strict: true
});

var TrackList = mongoose.model('TrackList', sTrackList);

TrackList.promiseTrackList = {
	'new': function (start, limit, asModels) {
		var p = proxmis();

		Track.find()
			.populate('details')
			.sort('-created_at')
			.skip(start)
			.limit(limit)
			.exec(p);

		if (asModels) {
			return when(p);
		}

		return when.map(when(p), function (model) {
			var track = model.toObject();
			return promiseSoundcloudDetails(track._id).then(
				function (details) {
					// if details is false, that means soundcloud no longer has the track
					// return false in that situation, since the track no longer exists
					if (details) {
						track.details = details;
						return track;
					} else {
						return false;
					}
				},
				// if the promise rejected, that means we had an error communicating with
				// soundcloud. This could mean they're offline, so we return what we stored at scan time
				function () {
					return track;
				}
			);
		});
	},

	'empty': function () {
		return when([]);
	}
};

module.exports = TrackList;