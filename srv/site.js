var env = process.env.NODE_ENV || 'development';
var isProduction = env === 'production';

// activate the newrelic process monitoring
if (isProduction) {
	require('newrelic');
}

// setup the when.js debugging for unhandled promise rejections
// eventually this should be made development only, but the site is still kinda beta
require('when/monitor/console');

// load express and any middleware dependencies that need to be saved
var express = require('express');
var expressSession = require("express-session");
var expressSessionRedisStore = require('connect-redis')(expressSession);

// load local modules
var config = require('app/config');
var log = require('app/log');

// load our database connections
var mongo = require('app/db/mongo');
var redis = require('app/db/redis');

var app = express();
app.set('port', process.env.PORT || 8000);

// we're proxying all requests through nginx, so tell express to trust our proxy
app.enable('trust proxy');

// initialize our custom view renderer
app.set('view', require('app/lib/view'));
app.set('views', __dirname + '/views/');

// register any local variables that are application-wide
app.locals.soundcloudKey = config.soundcloudKey;

// first middleware is the request logger
app.use(require('app/middleware/logger')());

// setup middleware for static assets. In production these should never be hit,
// since nginx serves them, but we still register them before any other middleware
// so that static assets don't invoke the session code
app.use(require('static-favicon')(__dirname + '/public/favicon.ico'));
app.use('/assets', express.static(__dirname + '/public/assets'));

// process the request cookies and register the session handler with a redis store
// app.use(require('cookie-parser')());
// app.use(expressSession({
// 	store: new expressSessionRedisStore({ client: redis }),
// 	secret: config.sessions.secret,
// 	key: config.sessions.cookieKey
// }));

// register any request specific locals.
var REGEX_FOR_JSON = /\.json\/?/;
app.use(function(req, res, next){
	var match = req.path.match(REGEX_FOR_JSON);
	var accept = req.headers.accept || '';

	if (match || accept.indexOf('json') > -1) {
		res.locals.wantsJSON = true;
	}

	res.locals.httproot = req.protocol + '://' + req.host;

	next();
});

// with all middleware in place, register the actual routers that handle the page requests.
app.use(require('app/routes/votes')());
app.use(require('app/routes/main')());

// if our site were able to have 404 errors, the handler for that would go here.
// mash.li only 404s when requesting specific tracks that don't exist, which is handled in
// the main router.

// finally, register an error handler at the tail end of the request.
app.use(require('errorhandler')({
	dumpExceptions:true,
	showStack:true
}));

// start the server.
var server = app.listen(app.get('port'), function() {
	log({
		level: 1,
		name: 'Express Server Started',
		status: 'Port '+app.get('port'),
		id: env
	});
});

// if we're on production, setup a sigterm hook so that the server can be gracefully terminated
if (isProduction) {
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

