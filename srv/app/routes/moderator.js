var express = require('express');
var validateUser = require('app/middleware/validateUser');
var log = require('app/log');

//map endpoints
module.exports = exports = function (sessions) {
	var router = express.Router();

	router.use(require('body-parser').json());

	router.param('trackid', require('app/middleware/loadTrack')());

	//setup endpoints
	router.post('/remove-track/:trackid', sessions, validateUser(true), exports.removeTrack);

	return router;
};



exports.removeTrack = function (req, res) {
	res.locals.track.update({dead: true}, log.fireAndForget({source: 'Moderator killing track'}));
	res.json({success: true});
};
