var express = require('express');
var promiseFromSoundcloudCache = require('app/lib/soundcloud-cache');
var config = require('app/config');
var log = require('app/log');

//map endpoints
module.exports = exports = function () {
	var router = express.Router();

	router.param('trackid', require('app/middleware/loadTrack')());

	router.use(require('app/middleware/visitor').loader);

	//setup endpoints
	router.get('/download/:trackid', exports.downloadTrack);

	return router;
};



exports.downloadTrack = function (req, res, next) {
	var track = res.locals.track;

	// Verify the visitor cookie exists
	if (!res.locals.visitorid) {
		if (res.locals.wantsJSON) {
			res.json(403, { error: { message: 'Expected visitor cookie was not found.' }});
		} else {
			res.status(403);
			res.locals.error = 'You may only download from the front page';
			res.locals.statusCode = 403;
			res.render('pages/error', res.locals);
		}
		return;
	}

	promiseFromSoundcloudCache(track.id).then(function (details) {
		if (!details.downloadable || !details.download_url) {
			if (res.locals.wantsJSON) {
				res.json(403, { error: { message: 'The requested track is not downloadable.' }});
			} else {
				res.status(403);
				res.locals.error = 'The requested track is not downloadable.';
				res.locals.statusCode = 403;
				res.render('pages/error', res.locals);
			}
			return;
		}

		res.redirect(details.download_url + '?client_id=' + config.soundcloudKey);

		track.update({$inc: {'downloads': 1}}, log.fireAndForget({source: 'Incrementing download count'}));
	}, next);
};
