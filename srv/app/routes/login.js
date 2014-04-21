var express = require('express');
var passport = require('passport');

//map endpoints
module.exports = exports = function () {
	var router = express.Router();

	router.use(require('body-parser')());

	//setup endpoints
	router.get('/login', exports.getLogin);
	router.post('/login', exports.postLogin);
	router.all('/logout', exports.allLogout);

	return router;
};

exports.getLogin = function (req, res) {
	res.render('pages/login', {
		messages: req.flash('error')
	});
};

exports.postLogin = function (req, res) {
	passport.authenticate('local', {
		successRedirect: req.session && req.session.goingTo || '/profile',
		failureRedirect: "/login",
		failureFlash: true
	})(req, res);
};

exports.allLogout = function (req, res) {
	req.logout();
	res.redirect('/login');
};
