
var Visitor = require('app/models/Visitor');
var COOKIE = 'vid';

exports.loader = function (req, res, next) {
	if (!req.cookies[COOKIE]) {return next();}

	var vid = req.cookies[COOKIE];

	res.locals.visitorid = vid;
	res.locals.visitor = Visitor.findById(vid).exec().then(function (visitor) {
		return visitor || new Visitor({_id: vid});
	});
	next();
};

exports.creator = function (req, res, next) {
	if (req.cookies[COOKIE]) {return next();}

	var vid = res.locals.visitorid = require('crypto').randomBytes(20).toString('hex');
	res.cookie(COOKIE, vid, { maxAge: 1000*60*60*24*365 });
	res.visitor = new Visitor({_id: vid});

	next();
};