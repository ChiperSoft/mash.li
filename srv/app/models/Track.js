var proxmis = require('proxmis');
var when = require('when');

require('app/models/SoundCloudTrack');
var mongoose = require('app/db/mongo');

var promiseFromSoundcloudCache = require('app/lib/soundcloud-cache');

var sTrack = mongoose.Schema({
	_id: String,
	details: { type: String, ref: 'SoundCloudTrack' },
	created_at: { type: Date, default: Date.now },
	votes: {
		'1': { type: Number, default: 0 },
		'-1': { type: Number, default: 0 }
	},
	votesActual: {
		'1': { type: Number, default: 0 },
		'-1': { type: Number, default: 0 }
	}
},{
	strict: true
});

var Track = mongoose.model('Track', sTrack);

Track.promiseTrackByID = function (id, asModel) {
	var p = Track.findOne({_id: id})
		.populate('details')
		.exec();

	if (asModel) {
		return when(p);
	}

	return p.then(function (model) {
		if (!model) {return false;}
		
		return model.promisePopulatedFromSoundcloud();
	});
};

Track.prototype.promisePopulatedFromSoundcloud = function () {
	var track = this.toObject();
	track.score = this.getScore();
	delete track.votesActual;
	return promiseFromSoundcloudCache(track._id).then(
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
};

Track.prototype.getScore = function () {
	return 1 + this.votes[1] - this.votes[-1];
};

Track.prototype.getActualScore = function () {
	return 1 + this.votesActual[1] - this.votesActual[-1];
};

module.exports = Track;