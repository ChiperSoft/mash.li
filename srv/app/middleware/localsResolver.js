var whenKeys = require('when/keys').all;

module.exports = function (req, res, next) {
	whenKeys(res.locals).then(
		function (locals) {
			res.locals = locals;
			next();
		},
		function (err) {
			next(err);
		}
	);
};
