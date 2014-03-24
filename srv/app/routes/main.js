var _ = require('lodash');
var express = require('express');
var whenKeysMap = require('when/keys').map;

var Setting = require('app/models/Setting');
var Track = require('app/models/Track');
var TrackList = require('app/models/TrackList');

var DEFAULT_LIST = 'new';
var DEFAULT_LIMIT = 25;

module.exports = exports = function () {

	var router = express.Router();
	
	router.use(exports.scanForJSON);
	router.use(exports.scanForTrack);
	router.use(exports.scanForList);
	router.use(exports.scanForPlay);
	router.use(exports.loadOther);
	router.use(exports.waitForPromises);
	router.get('*', exports.main);

	return router;
};

var REGEX_FOR_TRACK = /\/track\/([^\/]+)/;
exports.scanForTrack = function (req, res, next) {
	var match = req.path.match(REGEX_FOR_TRACK);
	if (!match) {return next();}

	if (match.index === 0) {
		res.locals.first = 'track';
	}

	res.locals.track = Track.promiseTrackByID(match[1]);
	next();
};

var REGEX_FOR_PLAY = /\/play\/?/;
exports.scanForPlay = function (req, res, next) {
	var match = req.path.match(REGEX_FOR_PLAY);
	if (match) {
		res.locals.play = true;
	}
	next();
};


var REGEX_FOR_START = /\/start\/(\d+)/;
var REGEX_FOR_LIMIT = /\/limit\/(\d+)/;
var REGEX_FOR_LISTNAME = /\/list\/([^\/]+)/;
exports.scanForList = function (req, res, next) {
	var match;

	match = req.path.match(REGEX_FOR_LISTNAME);
	var listname = match && match[1] || DEFAULT_LIST;
	res.locals.list = listname;
		
	if (match && match.index === 0) {
		res.locals.first = 'list';
	}

	match = req.path.match(REGEX_FOR_START);
	var start = match && Math.max(parseInt(match[1],10) - 1, 0) || 0;
	res.locals.start = start;

	match = req.path.match(REGEX_FOR_LIMIT);
	var limit = match && parseInt(match[1],10) || DEFAULT_LIMIT;
	res.locals.limit = limit;

	if (limit !== DEFAULT_LIMIT) {
		res.locals.limitIsCustom = true;
	}
	
	// first see if the list name is one of our computed lists
	if (TrackList.promiseTrackList[listname]) {
		res.locals.tracks = TrackList.promiseTrackList[listname](start, limit);
		res.locals.total = TrackList.promiseTotalTracks[listname]();
		return next();
	}

	// list is not computed, try loading it by name.
	res.locals.tracks = TrackList.promiseTrackList(listname, start, limit);
	res.locals.total = TrackList.promiseTotalTracks(listname);
	return next();
};

var REGEX_FOR_JSON = /\.json\/?/;
exports.scanForJSON = function (req, res, next) {
	var match = req.path.match(REGEX_FOR_JSON);
	var accept = req.headers.accept || '';

	if (match || accept.indexOf('json') > -1) {
		res.locals.wantsJSON = true;
	}

	next();
};

exports.loadOther = function (req, res, next) {
	res.locals.featuredLists = Setting.get('FeaturedLists');

	next();
};

exports.waitForPromises = function (req, res, next) {
	whenKeysMap(res.locals).then(
		function (locals) {
			locals.stop = Math.min(locals.start + locals.limit, locals.total);
			locals.prevPage = Math.max(0, locals.start - locals.limit);
			if (locals.stop < locals.total) {
				locals.nextPage = locals.stop;
			} else {
				locals.nextPage = false;
			}

			if (locals.track && locals.play) {
				locals.lastPlayed = locals.track._id;
			}

			res.locals = locals;
			next();
		},
		function (err) {
			var error = { error: _.assign({ message: err.message, stack: (err.stack || '').split('\n').slice(1).map(function(v){ return '' + v + ''; }) }, err)};

			console.warn(error);

			res.status(503);
			if (res.locals.wantsJSON) {
				res.json(error);
			} else {
				res.locals.error = err.toString()
					.replace(/\n/g, '')
					.replace(/&(?!\w+;)/g, '&amp;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;')
					.replace(/"/g, '&quot;');
				res.locals.statusCode = res.statusCode;
				res.locals.stack = error.stack;
				res.render('pages/error', res.locals);
			}
		}
	);
};

exports.main = function (req, res) {
	var locals = res.locals;
	if (locals.wantsJSON) {
		if (locals.first === 'track') {
			if (locals.track) {
				res.json(locals.track);
			} else {
				res.json(404, { error: { message: 'The requested track could not be found.' }});
			}
		} else if (locals.first === 'list' && !locals.tracks) {
			res.json(404, { error: { message: 'The requested list could not be found.' }});
		} else {
			res.json({
				start: locals.start,
				total: locals.tracks && locals.tracks.length || 0,
				tracks: locals.tracks
			});
		}

	} else {

		if (locals.first === 'track' && !locals.track) {
			res.status(404);
			res.locals.error = 'The requested track could not be found.';
			res.locals.statusCode = 404;
			res.render('pages/error', res.locals);
		} else if (locals.first === 'list' && !locals.tracks) {
			res.status(404);
			res.locals.error = 'The requested track list could not be found.';
			res.locals.statusCode = 404;
			res.render('pages/error', res.locals);
		} else {
			// res.json(res.locals);
			res.render('pages/index', res.locals);
		}

	}
};

// load the front page default list at launch time so we pre-cache the track info.
TrackList.promiseTrackList[DEFAULT_LIST](0, DEFAULT_LIMIT * 2);