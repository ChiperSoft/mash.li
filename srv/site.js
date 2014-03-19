require('newrelic');
var express = require('express');
var expressSession = require("express-session");
var expressSessionRedisStore = require('connect-redis')(expressSession);

var env = process.env.NODE_ENV || 'development';

require('when/monitor/console');

var config = require('app/config');
var log = require('app/log');
var mongo = require('app/db/mongo');
var redis = require('app/db/redis');

var app = express();

app.set('view', require('app/lib/view'));
app.set('views', __dirname + '/views/');
app.set('port', process.env.PORT || 8000);

app.locals.soundcloudKey = config.soundcloudKey;

app.use(require('app/middleware/logger')());

app.use(require('response-time')());
app.use(require('static-favicon')(__dirname + '/public/favicon.ico'));
app.use('/assets', express.static(__dirname + '/public/assets'));

app.use(require('cookie-parser')());
app.use(expressSession({
	store: new expressSessionRedisStore({ client: redis }),
	secret: config.sessions.secret,
	key: config.sessions.cookieKey
}));

app.use(function(req, res, next){
	res.locals.httproot = req.protocol + '://' + req.host;
	next();
});

app.use(require('app/routes/index')());

app.use(require('app/routes/404'));

app.use(require('errorhandler')({
	dumpExceptions:true,
	showStack:true
}));

var server = app.listen(app.get('port'), function() {
	log({
		level: 1,
		name: 'Express Server Started',
		status: 'Port '+app.get('port'),
		id: env
	});
});

if (env === 'production') {
	process.on('SIGTERM', function () {
		log({
			level: 1,
			name: 'Server is terminating, closing listening socket.',
		});
		server.close();
	});

	server.on('close', function () {
		log({
			level: 1,
			name: 'Shutdown',
		});

		redis.quit();
		mongo.disconnect();

		setTimeout( function () {
			log({
				level: 1,
				name: 'Could not close connections in time, forcefully shutting down.',
			});
			process.exit(1);
		}, 1000);
	});
}

