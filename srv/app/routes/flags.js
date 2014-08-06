var express = require('express');

var whenKeys = require('when/keys').all;
var sha1 = require('app/lib/sha1');
var log = require('app/log');

var Track = require('app/models/Track');

var DUPLICATE_VOTE_TIMEOUT = 1000 * 60 * 60 * 2;
var DUPLICATE_CUTOFF = 2;
var VISITORS_PER_IP_CUTOFF = 5;

module.exports = exports = function () {

	var router = express.Router();

	router.use(require('app/middleware/visitor').loader);
	router.post('/flag/:trackid/:reason?',
		exports.loadTrack,
		exports.processFlag
	);

	return router;
};

exports.loadTrack = function (req, res, next) {
	if (!req.params.trackid) {
		if (res.locals.wantsJSON) {
			res.json(400, { error: { message: 'You must define a track to flag on' }});
		} else {
			res.status(400);
			res.locals.error = 'You must define a track to flag on';
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
			res.locals.error = 'You may only flag from the front page';
			res.locals.statusCode = 403;
			res.render('pages/error', res.locals);
		}
		return;
	}

	Track
		.findById(req.params.trackid)
		.select({flags: {$elemMatch: { visitorId: res.locals.visitorid }}})
		.exec(function (err, track) {
			res.locals.track = track;
			next();
		});
};

exports.processFlag = function (req, res) {
	var ip = req.headers['x-forwarded-for'] || req.ip || req._remoteAddress || (req.socket && req.socket.socket.remoteAddress);
	var hash = sha1(ip);

	var visitor = res.locals.visitor;
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

/***********************************************************************************************************************************************************************************/

	var flag = track.flags && track.flags[0];
	var reason = req.params.reason;

	// we've done all we need before sending user feedback, we can finish the request here.
	if (res.locals.wantsJSON) {
		res.json({
			success: true,
			track: {
				id: track._id,
				flag: true
			}
		});
	} else {
		res.redirect('/track/' + track._id);
	}


	// Visitor has a previous flag. If the reason has changed, update the flag, but stop here
	if (flag) {
		if (flag.reason !== reason) {
			Track.update({_id: track._id, 'flags.visitorId': res.locals.visitorid}, {$set: {'flags.$.reason': reason}});
		}
		return;
	}

	// Visitor has not previously flagged this track, check if they are trusted and create a new flag.
	var trusted = visitor.isTrusted();
	flag = {
		track: track._id,
		ipHash: hash,
		visitorId: res.locals.visitorid,
		reason: reason
	};

	// If the visitor is trusted, add the flag to the track and stop here.
	if (trusted) {
		track.update({$push: {flags: flag}}, log.fireAndForget({source: 'Appending flag to track (known trust level)'}));
		return;
	}

/***********************************************************************************************************************************************************************************/

	var historical = {

		totalValidFlagsByVisitor: Track
			.find({'flags.visitorId': visitor._id})
			.where('created_at').lte(Date.now() - DUPLICATE_VOTE_TIMEOUT)
			.count().exec(),

		totalFlagsByIPForTrack: Track
			.find({_id: track._id, 'flags.ipHash': hash})
			.where('created_at').gt(Date.now() - DUPLICATE_VOTE_TIMEOUT)
			.count().exec(),

		totalVisitorsForIP: Track
			.aggregate([
				{$match: { 'flags.ipHash': hash}},
				{$unwind: "$flags"},
				{$group: { _id: '$flags.visitorId' }}
			])
			.exec().then(function (response) {
				return response.length;
			})

	};

	whenKeys(historical).then(function (historical) {
		var trustShift = 0;

		if (historical.totalValidFlagsByVisitor) {
			trustShift = 1;
		} else if (historical.totalFlagsByIPForTrack > DUPLICATE_CUTOFF && historical.totalVisitorsForIP > VISITORS_PER_IP_CUTOFF) {
			trustShift = -1;
		}

		if (trustShift) {
			visitor.update({$inc: {trust: trustShift}}, {upsert: true}, log.fireAndForget({source: 'Visitor trust save in flags.js'}));
		}

		if (trustShift === -1) {
			trusted = false;
		}

		// Do not record the flag if the user is untrustworthy.
		if (trusted !== false) {
			track.update({$push: {flags: flag}}, log.fireAndForget({source: 'Appending flag to track (unknown trust level)'}));
		}
	});

};
