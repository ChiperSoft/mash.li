
var Track = require('app/models/Track');

module.exports = function () {
	return function (req, res, next) {
		if (!req.params.trackid) {
			if (res.locals.wantsJSON) {
				res.json(400, { error: { message: 'You must define a track to vote on' }});
			} else {
				res.status(400);
				res.locals.error = 'You must define a track to vote on';
				res.locals.statusCode = 400;
				res.render('pages/error', res.locals);
			}
			return;
		}

		Track
		.findById(req.params.trackid)
		.exec(function (err, track) {
			if (err) { return next(err); }

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

			res.locals.track = track;
			next();
		});
	};
};
