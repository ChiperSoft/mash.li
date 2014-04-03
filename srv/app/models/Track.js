var when = require('when');

require('app/models/SoundCloudTrack');
var mongoose = require('app/db/mongo');

var promiseFromSoundcloudCache = require('app/lib/soundcloud-cache');

var sTrack = mongoose.Schema({
	_id: String,
	details: {
		title: String,
		duration: Number,
		genre: String,
		tags: [String],
		permalink_url: String,
		uri: String,
		stream_url: String,
		artwork_url: String,
		user: {
			id: Number,
			username: String,
			uri: String,
			avatar_url: String,
			permalink_url: String
		},
		trackLink: { type: String, ref: 'Track'},
		created_at: { type: Date, default: Date.now },
		first_scanned_at: { type: Date, default: Date.now },
		last_scanned_at: Date
	},
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

Track.promiseTrackByID = function (id, options) {
	options = options || {};

	var p = Track.findOne({_id: id}).exec();

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
	if (!this.votes) {return 1;}
	return 1 + parseInt(this.votes[1],10) - parseInt(this.votes[-1],10);
};

Track.prototype.getActualScore = function () {
	if (!this.votesActual) {return 1;}
	return 1 + parseInt(this.votesActual[1]) - parseInt(this.votesActual[-1]);
};

module.exports = Track;
