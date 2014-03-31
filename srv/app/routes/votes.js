var express = require('express');

var sha1 = require('app/lib/sha1');
var log = require('app/log');

var localsResolver = require('app/middleware/localsResolver');

var Track = require('app/models/Track');
var TrackVote = require('app/models/TrackVote');

var DUPLICATE_VOTE_TIMEOUT = 1000*60*60*12;
var DUPLICATE_CUTOFF = 10;
var UNTRUSTWORTHY_IP_CUTOFF = 50;

module.exports = exports = function () {

	var router = express.Router();
	
	router.use(require('app/middleware/visitor').loader);
	router.all('/vote/:trackid/:direction',
		exports.loadTrack,
		exports.validateTrackAndVisitor,
		exports.checkExistingAndTrustedVote,
		exports.validateUntrustedVote
	);

	return router;
};

exports.loadTrack = function (req, res, next) {
	if (!req.params.trackid) {
		if (res.locals.wantsJSON) {
			res.json(400, { error: { message: 'You must define a track to vote on' }});
		} else {
			res.status(400);
			res.locals.error = 'You must define a track to vote on';
			res.locals.statusCode = 400;
			res.render('pages/error', res.locals);
		}
	}

	res.locals.track = Track.promiseTrackByID(req.params.trackid, {asModel: true});

	localsResolver(req, res, next);
};

exports.validateTrackAndVisitor = function (req, res, next) {
	var track = res.locals.track;
	
	// Verify the requested track exists.
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

	// Verify the visitor cookie exists
	if (!res.locals.visitorid) {
		if (res.locals.wantsJSON) {
			res.json(403, { error: { message: 'Expected visitor cookie was not found.' }});
		} else {
			res.status(403);
			res.locals.error = 'You may only vote from the front page';
			res.locals.statusCode = 403;
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
	res.locals.delta = delta;

	res.locals.vote = TrackVote.promisePreviousVote(req.params.trackid, res.locals.visitorid);

	localsResolver(req, res, next);
};

exports.checkExistingAndTrustedVote = function (req, res, next) {
	var ip = req.headers['x-forwarded-for'] || req.ip || req._remoteAddress || (req.socket && req.socket.socket.remoteAddress);
	var hash = sha1(ip);

	var track = res.locals.track;
	var vote = res.locals.vote;
	var delta = res.locals.delta;

	// Visitor has a previous track. If the delta has changed, update the track and resave the vote.
	if (vote) {

		if (vote.delta !== delta) {
			if (vote.delta) {
				track.votes[vote.delta]--;
				track.votesActual[vote.delta]--;
				track.markModified('votes');
				track.markModified('votesActual');
			}
			if (delta) {
				track.votes[delta]++;
				track.votesActual[delta]++;
				track.markModified('votes');
				track.markModified('votesActual');
			}
			track.save();

			vote.ipHash = hash;
			vote.created_at = Date.now();
			vote.delta = delta;
			vote.save();
		}


		if (res.locals.wantsJSON) {
			res.json({vote: vote.toObject()});
		} else {
			res.redirect('/track/' + track._id);
		}
		return;
	}

	// Visitor has not previously voted on this track, check if they are trusted and create a new vote.
	var trusted = res.locals.visitor && res.locals.visitor.isTrusted();

	vote = res.locals.vote = new TrackVote({
		track: track._id,
		ipHash: hash,
		visitorId: res.locals.visitorid,
		trusted: trusted,
		delta: delta
	});

	vote.save(log.fireAndForget({source: 'TrackVote save in votes.js'}));

	res.locals.visitor.update({$inc: {voteCount: 1}}, {upsert:true}, log.fireAndForget({source: 'Visitor voteCount increment in votes.js'}));

	// if the visitor is trusted, we can just save the vote and stop here.
	// we don't need to do anything with the save callback
	if (trusted === true) {
		track.votes[delta]++;
		track.votesActual[delta]++;
		track.markModified('votes');
		track.markModified('votesActual');
		track.save(log.fireAndForget({source: 'Trusted visitor Track save in votes.js'}));

		if (res.locals.wantsJSON) {
			res.json({vote: vote.toObject()});
		} else {
			res.redirect('/track/' + track._id);
		}
		return;
	}

	// If the visitor has been found to be untrustworthy, just save their vote and do not alter the track score
	if (trusted === false) {
		if (res.locals.wantsJSON) {
			res.json({vote: vote.toObject()});
		} else {
			res.redirect('/track/' + track._id);
		}
		return;
	}

	// User has an indeterminate level of trust, load historical data and continue on.
	res.locals.totalValidVotesByVisitor = TrackVote
		.find({visitorId: res.locals.visitorid})
		.where('created_at').lte(Date.now() - DUPLICATE_VOTE_TIMEOUT)
		.exec();

	res.locals.totalVotesByIPForTrack = TrackVote
		.find({track: track._id, ipHash: hash})
		.where('created_at').gt(Date.now() - DUPLICATE_VOTE_TIMEOUT)
		.count()
		.exec();

	res.locals.totalUntrustedVotesByIP = TrackVote
		.find({ipHash: hash})
		.count()
		.exec();

	localsResolver(req, res, next);
};

exports.validateUntrustedVote = function (req, res) {

	var track = res.locals.track;
	var vote = res.locals.vote;
	var delta = res.locals.delta;
	var visitor = res.locals.visitor;

	var trustShift = 0;

	do {

		if (res.locals.totalValidVotesByVisitor) {
			trustShift = 1;
			break;
		}

		if (res.locals.totalVotesByIPForTrack < DUPLICATE_CUTOFF) {
			break;
		}

		if (res.locals.totalUntrustedVotesByIP < UNTRUSTWORTHY_IP_CUTOFF) {
			break;
		}

		trustShift = -1;
		
	} while(0);

	if (trustShift) {
		visitor.update({$inc: {trust: trustShift}}, {upsert: true}, log.fireAndForget({source: 'Visitor trust save in votes.js'}));
	}

	track.votes[delta]++;
	track.markModified('votes');

	if (trustShift >= 0) {
		track.votesActual[delta]++;
		track.markModified('votesActual');
	}

	track.save(log.fireAndForget({source: 'Indeterminate trust Track save in votes.js'}));

	if (res.locals.wantsJSON) {
		res.json({vote: vote.toObject()});
	} else {
		res.redirect('/track/' + track._id);
	}

};
