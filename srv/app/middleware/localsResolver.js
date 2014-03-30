var whenKeysMap = require('when/keys').map;

module.exports = function (req, res, next) {
	whenKeysMap(res.locals).then(
		function (locals) {
			res.locals = locals;
			next();
		},
		function (err) {
			next(err);
		}
	);
};