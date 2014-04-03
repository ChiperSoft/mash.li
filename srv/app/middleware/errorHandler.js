/*jshint unused:false */

var _ = require('lodash');

module.exports = function () {
	return function (err, req, res, next) {
		var error = { error: _.assign({ message: err.message, stack: (err.stack || '').split('\n').slice(1).map(function (v) { return '' + v + ''; }) }, err)};

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

	};
};
