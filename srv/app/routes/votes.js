var express = require('express');
var whenKeysMap = require('when/keys').map;
var sha1 = require('app/lib/sha1');

var Track = require('app/models/Track');
var TrackVote = require('app/models/TrackVote');

var DUPLICATE_VOTE_TIMEOUT = 1000*60*60;

module.exports = exports = function () {

	var router = express.Router();
	
	router.post('/vote/:trackid/:direction', exports.voteTrack);

	return router;
};

exports.voteTrack = function (req, res) {
	var ip = req.headers['x-forwarded-for'] || req.ip || req._remoteAddress || (req.socket && req.socket.socket.remoteAddress);
	var hash = sha1(ip);

	whenKeysMap({
		track: Track.promiseTrackByID(req.params.trackid, true),
		vote: TrackVote.promisePreviousVote(req.params.trackid, hash)
	}).then(function (data) {
		var track = data.track;
		var vote = data.vote;

		if (!track) {
			if (res.locals.wantsJSON) {
				res.json(404, { error: { message: 'The requested track could not be found.' }});
			} else {
				res.status(404);
				res.locals.error = 'The requested track could not be found.';
				res.locals.statusCode = 404;
				res.render('pages/error', res.locals);
			}
			return;
		}

		if (!track.votes) {
			track.votes = {
				'1':0,
				'-1':0
			};
		}

		if (!track.votesActual) {
			track.votesActual = {
				'1':0,
				'-1':0
			};
		}

		var delta = 0;
		switch (req.params.direction) {
		case '1':
		case 'up':
			delta = 1;
			break;
		case '-1':
		case 'down':
			delta = -1;
			break;
		}

		// if a vote exists for this track from this user (determined by ip) and that vote was
		// made in the last DUPLICATE_VOTE_TIMEOUT, process the vote as if from the same person.
		// This is done to try to prevent voter fraud, since we don't require a user account for votes,
		// but also can't trust IP addresses to always be the same person.
		if (vote && (Date.now() - vote.created_at < DUPLICATE_VOTE_TIMEOUT)) {
			// If the vote is for the same delta, accept the vote but vote equally in the opposite direction and
			// don't increment voteActual. The hope is that this will curb the majority of vote fraud, but I'll
			// probably have to re-evaluate at a later date.

			if (vote.delta === delta) {
				track.votes[delta]++;
				track.votes[-delta]++;
				track.markModified('votes');
			} else {
				// new vote differs from their previous vote. decrement the previous vote count and increment the new direction
				// as long as the values aren't a neutral vote.

				if (vote.delta) {
					track.votes[vote.delta]--;
					track.votesActual[vote.delta]--;
				}
				if (delta) {
					track.votes[delta]++;
					track.votesActual[delta]++;
				}

				vote.delta = delta;
				vote.save();
			}
		} else {
			// old vote either doesn't exist or is more than DUPLICATE_VOTE_TIMEOUT minutes old, allow another vote.
			vote = new TrackVote();
			vote.track = track._id;
			vote.visitorHash = hash;
			vote.delta = delta;
			vote.save();

			track.votes[delta]++;
			track.votesActual[delta]++;
		}

		track.markModified('votes');
		track.markModified('votesActual');
		track.save();

		if (res.locals.wantsJSON) {
			res.json({vote: vote.toObject()});
		} else {
			res.redirect('/track/'+track._id);
		}
	});

};