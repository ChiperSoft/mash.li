var express = require('express');
var passport = require('passport');

//map endpoints
module.exports = exports = function (sessions) {
	var router = express.Router();

	router.use(require('body-parser').urlencoded({extended: true}));
	router.use(require('app/middleware/newrelic')());

	//setup endpoints
	router.get('/login', sessions, exports.getLogin);
	router.post('/login', sessions, exports.postLogin);
	router.all('/logout', sessions, exports.allLogout);

	return router;
};

exports.getLogin = function (req, res) {
	res.render('pages/login', {
		messages: req.flash('error')
	});
};

exports.postLogin = function (req, res) {
	passport.authenticate('local', {
		successRedirect: req.session && req.session.goingTo || '/',
		failureRedirect: "/login",
		failureFlash: true
	})(req, res);
};

exports.allLogout = function (req, res) {
	req.logout();
	res.redirect('/login');
};
