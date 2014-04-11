var config = require('app/config');
var redis = require('app/db/redis');

var expressSession = require("express-session");
var ExpressSessionRedisStore = require('connect-redis')(expressSession);

module.exports = function () {
	return expressSession({
		store: new ExpressSessionRedisStore({ client: redis }),
		secret: config.sessions.secret,
		key: config.sessions.cookieKey
	});
};
