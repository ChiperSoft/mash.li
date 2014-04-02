var when = require('when');

require('app/models/SoundCloudTrack');
var mongoose = require('app/db/mongo');

var promiseFromSoundcloudCache = require('app/lib/soundcloud-cache');

var sTrack = mongoose.Schema({
	_id: String,
	details: { type: String, ref: 'SoundCloudTrack' },
	created_at: { type: Date, default: Date.now },
	votes: [{
		visitorId: String,
		ipHash: String,
		delta: { type: Number, default: 0 },
		trusted: Boolean,
		created_at: { type: Date, default: Date.now }
	}]
},{
	strict: true
});

sTrack.index({'votes.ip':1});

var Track = mongoose.model('Track', sTrack);

Track.promiseTrackByID = function (id, options) {
	options = options || {};

	var p = Track.findOne({_id: id})
		.populate('details')
		.exec();

	if (options.asModel) {
		return when(p);
	}

	return p.then(function (model) {
		if (!model) {return false;}
		
		return model.promiseForRendering(options.visitorid);
	});
};

Track.prototype.promiseForRendering = function (visitorid) {
	var track = this.toObject();
	track.score = this.getScore();
	delete track.votesActual;

	var waiting = [];

	waiting.push(promiseFromSoundcloudCache(track._id).then(
		function (details) {
			// if details is false, that means soundcloud no longer has the track
			// return false in that situation, since the track no longer exists
			if (details) {
				track.details = details;
				return track;
			} else {
				track.details = false;
				return false;
			}
		},
		// if the promise rejected, that means we had an error communicating with
		// soundcloud. This could mean they're offline, so we return what we stored at scan time
		function () {
			return track;
		}
	));

	if (visitorid) {
		waiting.push(require('app/models/TrackVote').promisePreviousVote(track._id, visitorid).then(
			function (vote) {
				// if vote is false, the user has not voted on this track
				if (vote) {
					track.voted = vote && vote.delta || 0;
					return track;
				} else {
					track.voted = 0;
					return false;
				}
			},
			// the promise shouldn't ever reject, but if it does, pretend the user didn't vote
			function () {
				track.voted = 0;
				return track;
			}
		));
	}

	return when.all(waiting).then(function () {
		if (track.details) {
			return track;
		}

		return false;
	});

};

Track.prototype.getScore = function () {
	return 1 + this.votes[1] - this.votes[-1];
};

Track.prototype.getActualScore = function () {
	return 1 + this.votesActual[1] - this.votesActual[-1];
};

module.exports = Track;