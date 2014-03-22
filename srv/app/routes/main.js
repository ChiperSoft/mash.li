var express = require('express');
var when = require('when');
var whenKeysMap = require('when/keys').map;
var Track = require('app/models/Track');
var TrackList = require('app/models/TrackList');
var promiseFromSoundcloudCache = require('app/lib/soundcloud-cache');
var _ = require('lodash');

module.exports = exports = function () {

	var router = express.Router();
	
	router.use(exports.scanForJSON);
	router.use(exports.scanForTrack);
	router.use(exports.scanForList);
	router.use(exports.scanForPlay);
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
	var listname = match && match[1] || 'new';

	if (match && match.index === 0) {
		res.locals.first = 'list';
	}

	if (!TrackList.promiseTrackList[listname]) {
		res.locals.tracks = false;
		return next();
	}

	match = req.path.match(REGEX_FOR_START);
	var start = match && parseInt(match[1],10) || 0;

	match = req.path.match(REGEX_FOR_LIMIT);
	var limit = match && parseInt(match[1],10) || 25;
	
	res.locals.start = start;
	res.locals.limit = limit;
	res.locals.list = 'new';
	res.locals.tracks = TrackList.promiseTrackList[listname](start, limit);

	next();
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

exports.waitForPromises = function (req, res, next) {
	whenKeysMap(res.locals).then(
		function (locals) {
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
			res.render('pages/index', res.locals);
		}

	}
};