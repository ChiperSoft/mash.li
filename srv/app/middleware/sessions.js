var config = require('app/config');
var redis = require('app/db/redis');
var User = require('app/models/User');

var expressSession = require("express-session");
var ExpressSessionRedisStore = require('connect-redis')(expressSession);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
	{
		usernameField: 'email',
		passwordField: 'password'
	},

	function (email, password, done) {

		//Retrieve the user from the database by login
		User.findOne({email: email}, function (err, user) {

			//If something weird happens, abort.
			if (err) {
				return done(err);
			}

			//If we couldn't find a matching user, flash a message explaining what happened
			if (!user) {
				return done(null, false, { message: 'Login not found' });
			}

			user.checkPassword(password, function (err, match) {
				if (err) {done(err);}

				if (!match) {
					return done(null, false, { message: 'Incorrect Password' });
				}

				// password match, yield the user record.
				done(null, user);

			});

		});
	}
));

passport.serializeUser(function (user, done) {
	done(null, user && user._id);
});

passport.deserializeUser(function (id, done) {
	User.findOne({_id: id}, done);
});

module.exports = function (app) {

	app.use(expressSession({
		store: new ExpressSessionRedisStore({ client: redis }),
		secret: config.sessions.secret,
		cookieName: config.sessions.cookieKey,
		key: config.sessions.cookieKey
	}));

	app.use(require('connect-flash')());

	app.use(passport.initialize());
	app.use(passport.session());
	app.use(function (req, res, next) {
		if (req.isAuthenticated()) {
			res.locals.user = req.user;
		}
		next();
	});


};
