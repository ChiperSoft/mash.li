
var log = require('app/log');
var Visitor = require('app/models/Visitor');
var COOKIE = 'vid';

exports.loader = function (req, res, next) {
	if (!req.cookies[COOKIE]) {return next();}

	var vid = req.cookies[COOKIE];

	res.locals.visitorid = vid;
	Visitor.findById(vid).exec().then(
		function (visitor) {
			res.locals.visitor = visitor || new Visitor({_id: vid});
			next();
		},
		log.fireAndForget({source: 'app/middleware/visitor load request'})
	);
};

exports.creator = function (req, res, next) {
	if (req.cookies[COOKIE]) {return next();}

	var vid = res.locals.visitorid = require('crypto').randomBytes(20).toString('hex');
	res.cookie(COOKIE, vid, { maxAge: 1000 * 60 * 60 * 24 * 365 });
	res.locals.visitor = new Visitor({_id: vid});

	next();
};
