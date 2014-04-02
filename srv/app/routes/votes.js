var express = require('express');

var whenKeysMap = require('when/keys').map;
var sha1 = require('app/lib/sha1');
var log = require('app/log');

var Track = require('app/models/Track');

var DUPLICATE_VOTE_TIMEOUT = 1000*60*60*12;
var DUPLICATE_CUTOFF = 10;
var VISITORS_PER_IP_CUTOFF = 50;

module.exports = exports = function () {

	var router = express.Router();
	
	router.use(require('app/middleware/visitor').loader);
	router.all('/vote/:trackid/:direction',
		exports.loadTrack,
		exports.processVote
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

	Track
		.findById(req.params.trackid)
		.select({votes: {$elemMatch: { visitorId: res.locals.visitorid }}})
		.exec(function (err, track) {
			res.locals.track = track;
			next();
		});

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
};

exports.processVote = function (req, res, next) {
	var ip = req.headers['x-forwarded-for'] || req.ip || req._remoteAddress || (req.socket && req.socket.socket.remoteAddress);
	var hash = sha1(ip);

	var visitor = res.locals.visitor;
	var delta = res.locals.delta;
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

	if (track.votes.length > 1) {
		return next(new Error('More than one previous vote was found for this visitor.'));
	}

/***********************************************************************************************************************************************************************************/

	var vote = track.votes[0];

	// we've done all we need before sending user feedback, we can finish the request here.
	if (res.locals.wantsJSON) {
		res.json({
			success: true,
			track: {
				id: track._id,
				vote: delta
			}
		});
	} else {
		res.redirect('/track/' + track._id);
	}
	

	// Visitor has a previous vote. If the delta has changed, update the vote and stop here
	if (vote) {
		if (vote.delta !== delta) {
			Track.update({_id: track._id, 'votes.visitorId': res.locals.visitorid}, {$set: {'votes.$.delta': delta}});
		}
		return;
	}

	// Visitor has not previously voted on this track, check if they are trusted and create a new vote.
	var trusted = visitor.isTrusted();
	vote = {
		track: track._id,
		ipHash: hash,
		visitorId: res.locals.visitorid,
		trusted: trusted,
		delta: delta
	};

	// log that they've made a vote. This creates the visitor record for the first time if they've never voted
	visitor.update({$inc: {voteCount: 1}}, {upsert:true}, log.fireAndForget({source: 'Visitor voteCount increment in votes.js'}));
	
	// If a trust level (be it true or false) is known for the user, add the vote to the track and stop here.
	if (trusted !== null) {
		track.update({$push: {votes: vote}}, log.fireAndForget({source: 'Appending vote to track (known trust level)'}));
		return;
	}

/***********************************************************************************************************************************************************************************/

	var historical = {

		totalValidVotesByVisitor: Track
			.find({'votes.visitorId': visitor._id})
			.where('created_at').lte(Date.now() - DUPLICATE_VOTE_TIMEOUT)
			.count().exec(),

		totalVotesByIPForTrack: Track
			.find({_id: track._id, 'votes.ipHash': hash})
			.where('created_at').gt(Date.now() - DUPLICATE_VOTE_TIMEOUT)
			.count().exec(),

		totalVisitorsForIP: Track
			.aggregate([
				{$match: { 'votes.ipHash': '4b84b15bff6ee5796152495a230e45e3d7e947d9'}},
				{$unwind: "$votes"},
				{$group: { _id: '$votes.visitorId' }}
			])
			.exec().then(function (response) {
				return response.results.length;
			})

		};
	
	whenKeysMap(historical).then(function (historical) {
		var trustShift = 0;

		if (historical.totalValidVotesByVisitor) {
			trustShift = 1;
		} else if (historical.totalVotesByIPForTrack > DUPLICATE_CUTOFF && historical.totalVisitorsForIP > VISITORS_PER_IP_CUTOFF) {
			trustShift = -1;
		}

		if (trustShift) {
			visitor.update({$inc: {trust: trustShift}}, {upsert: true}, log.fireAndForget({source: 'Visitor trust save in votes.js'}));
		}

		if (trustShift = -1) {
			vote.trusted = false;
		}

		track.update({$push: {votes: vote}}, log.fireAndForget({source: 'Appending vote to track (unknown trust level)'}));
	});

};
