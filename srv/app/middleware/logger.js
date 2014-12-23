var log = require('app/log');
var logger = require('morgan');

var cluster = require('cluster');
var bytes = require('bytes');

module.exports = function () {
	return logger(function (tokens, req, res) {
		var status = res.statusCode,
			len = parseInt(res.getHeader('Content-Length'), 10),
			clus = cluster.worker && ' ' + cluster.worker.id || '',
			color = 32;

		if (status >= 500) {color = 31;}
		else if (status >= 400) {color = 33;}
		else if (status >= 300) {color = 36;}

		len = isNaN(len) ? '' : ' ' + bytes(len);

		return log({
			level: 1,
			source: 'express',
			name: tokens.method(req, res),
			status: tokens.status(req, res),
			extra: req.headers['x-forwarded-for'] || tokens['remote-addr'](req, res),
			target: tokens.url(req, res),
			id: (new Date - req._startTime) + 'ms' + len + clus
		});
	});
};
