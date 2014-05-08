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
	dead: { type: Boolean, default: false },
	created_at: { type: Date, default: Date.now },
	votes: [{
		visitorId: String,
		ipHash: String,
		delta: { type: Number, default: 0 },
		trusted: Boolean,
		created_at: { type: Date, default: Date.now }
	}],
	flags: [{
		visitorId: String,
		ipHash: String,
		reason: String,
		created_at: { type: Date, default: Date.now }
	}],
	downloads: { type: Number, default: 0 }
});

sTrack.index({'votes.ip': 1});

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
	var voteData = this.getVoteData(visitorid);

	track.votes = {
		up: voteData.up,
		down: voteData.down
	};
	track.score = voteData.score;
	track.voted = voteData.visitorVote;

	return promiseFromSoundcloudCache(track._id).then(
		function (details) {
			// if details is false, that means soundcloud no longer has the track
			// return false in that situation, since the track no longer exists
			if (details) {
				track.details = details;
				return track;
			} else {
				track.details = false;
				Track.update({_id: track._id}, {$set: {dead: true}}).exec();
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

Track.prototype.getVoteData = function (visitorid) {
	var data = {
		up: 0,
		upReal: 0,
		down: 0,
		downReal: 0,
		score: 1,
		scoreReal: 1,
		visitorVote: 0
	};

	this.votes.forEach(function (vote) {

		var trusted = vote.trusted !== -1;

		data.score += vote.delta;
		if (trusted) {data.scoreReal += vote.delta;}

		if (vote.delta > 1) {
			data.up++;
			if (trusted) {data.upReal++;}
		} else if (vote.delta < 1) {
			data.down++;
			if (trusted) {data.downReal++;}
		} else {
			data.up++;
			data.down++;
			if (trusted) {
				data.upReal++;
				data.downReal++;
			}
		}

		if (visitorid && vote.visitorId === visitorid) {
			data.visitorVote = vote.delta;
		}

	});

	// Count flags as down votes when calculating temperature
	data.scoreReal -= (this.flags && this.flags.length || 0);

	var decay = 84;
	var order = Math.log(Math.max(Math.abs(data.scoreReal), 1), 10),
		dayAge = (Date.now() - this.created_at.getTime()) / (3600000);

	data.temperature = order - dayAge / decay;


	return data;
};

Track.prototype.getVotesUp = function () {
	if (!this.votes || !this.votes.length) {return 0;}

	return this.votes.reduce(function (score, vote) {
		if (vote.delta > 0) {
			return score + vote.delta;
		} else {
			return score;
		}
	}, 0);
};

Track.prototype.getVotesDown = function () {
	if (!this.votes || !this.votes.length) {return 0;}

	return this.votes.reduce(function (score, vote) {
		if (vote.delta < 0) {
			return score + vote.delta;
		} else {
			return score;
		}
	}, 0);
};

Track.prototype.getScore = function () {
	if (!this.votes || !this.votes.length) {return 1;}

	return this.votes.reduce(function (score, vote) {
		return score + vote.delta;
	}, 1);
};

Track.prototype.getActualScore = function () {
	if (!this.votes || !this.votes.length) {return 1;}

	return this.votes.reduce(function (score, vote) {
		if (vote.trusted === undefined || vote.trusted > -1) {
			return score + vote.delta;
		} else {
			return score;
		}
	}, 1);
};

module.exports = Track;
