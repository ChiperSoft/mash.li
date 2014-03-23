
var proxmis = require('proxmis');
var when = require('when');

var mongoose = require('app/db/mongo');
var Track = require('app/models/Track');

var promiseSoundcloudDetails = require('app/lib/soundcloud-cache');

var sTrackList = mongoose.Schema({
	_id: String,
	tracks: [{ type: String, ref: 'Track' }],
	created_at: { type: Date, default: Date.now }
},{
	strict: true
});

var TrackList = mongoose.model('TrackList', sTrackList);

TrackList.promiseTrackList = function (name, start, limit, asModels) {
	var p = proxmis();

	TrackList.findOne({_id: name})
		.populate({
			path: 'tracks',
			options: {
				skip: start,
				limit: limit
			}
		})
		.exec(p);

	p = p.then(function (tracklist) {
		if (!tracklist) {
			return false;
		}

		var p2 = proxmis();
		Track.populate(tracklist.tracks, {path: 'details'}, p2);

		return when(p2).then(function () {
			return tracklist;
		});
	});

	if (asModels) {
		return when(p);
	}

	return p.then(function (tracklist) {
		if (!tracklist || !tracklist.tracks || !tracklist.tracks.length) {
			return false;
		}

		return when.map(tracklist.tracks, function (model) {
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
	});

};

TrackList.promiseTrackList['new'] = function (start, limit, asModels) {
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
};

TrackList.promiseTrackList.empty = function () {
	return when([]);
};


TrackList.promiseTotalTracks = function (name) {
	var p = proxmis();

	TrackList.findOne({_id: name}, p);

	return when(p).then(function (tracklist) {
		return tracklist.tracks.length;
	});
};

TrackList.promiseTotalTracks['new'] = function () {
	var p = proxmis();

	Track.count({}, p);

	return when(p);
};

TrackList.promiseTotalTracks.empty = function () {
	return when.resolve(0);
};


module.exports = TrackList;