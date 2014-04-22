
module.exports = function (isModerator) {

	return function (req, res, next) {

		if (!req.isAuthenticated()) {
			//If the user is not authorized, save the location that was being accessed so we can redirect afterwards.
			req.session.goingTo = req.url;
			res.redirect('/login');
			return;
		}

		//If a role was specified, make sure that the user has it.
		if (isModerator && !req.user.isModerator) {
			res.status(403);
			res.locals.error = 'You must be a moderator to access that page.';
			res.locals.statusCode = 403;
			res.render('pages/error', res.locals);
		}

		next();
	};

};
