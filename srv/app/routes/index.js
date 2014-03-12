var express = require('express');
var whenKeysMap = require('when/keys').map;
var Track = require('app/models/Track');
var _ = require('lodash');

module.exports = exports = function () {

	var router = express.Router();
	
	router.get('/', exports.getMain);
	router.get('/track/:trackid', exports.getMain);
	router.get('/track/:trackid/:directive?*', exports.getMain);
	
	return router;
};

exports.getMain = function (req, res) {
	var load = {
		playlists: whenKeysMap({
			'new': Track.promiseForListNew()
		})
	};

	if (req.params.trackid) {
		load.track = Track.promiseForID(req.params.trackid);
	}

	var directives = req.params.directive && req.params.directive.split('/') || [];

	if (directives[0] === 'play') {
		load.play = true;
	}

	whenKeysMap(load).then(function (data) {
		data.lists = _.mapValues(data.playlists, function (list) {
			return {
				tracks: list,
				lastPlayed: req.params.trackid,
				ids: _.map(list, function (track) {return track.details._id; })
			};
		});
		res.render('pages/index', data);
	});
};
