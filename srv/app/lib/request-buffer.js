// This module works by taking advantage of a feature of promises, that if a promise is already resolved
// then it will instantly call any onResolved function that gets added with .then().  Any time a request
// is made for an id we don't have yet, we store the deferral that gets created for the request and
// reuse that deferral's promise for all subsequent requests of the same id.

// This module performs request pooling. The module is invoked for single ids, but to avoid making
// dozens of individual requests, we collect multiple ids together and request them all at once.
// This is done by putting the actual id processing request on a timeout.  The first request kicks
// off the timer and until that timer expires all other calls to make the request are ignored.


var _ = require('lodash');
var when = require('when');

module.exports = exports = function (processor, options) {
	if (typeof processor === 'function') {
		options = options || {};
		options.processor = processor;
	} else {
		options = processor || {};
	}

	options = _.assign({
		limit: false,
		timer: 30,
		ttl  : -1
	}, options);

	if (!options.processor) {
		throw new Error('request-buffer cannot be initialized without a processor function');
	}

	if (!({'number': 1, 'boolean': 1, 'function': 1, 'undefined': 1}[typeof options.limit])) {
		throw new TypeError('request-buffer limit option is not of a supported type.');
	}

	var cache = {};
	var pending = {};
	var fetching;

	var get, invalidate, start, fetch;

	get = function (id) {
		// if we already have a stored promise for this id, and the promise has not expired
		// return our cached promise and call it done.
		if (cache[id] && (options.ttl <= 0 || Date.now() - cache[id].created < options.ttl) ) {
			return cache[id].promise;
		}

		// create a new deferral and store it in the cache, with a creation date
		var defer;

		defer = when.defer();
		defer.created = Date.now();

		if (options.ttl > 0) {
			defer.timeout = setTimeout(function () {
				invalidate(id);
			}, options.ttl);
		}

		// if ttl is -1, we don't want to cache the results at all.
		if (options.ttl > -1) {
			cache[id] = defer;
		}

		// add the request id to the pending requests collection since we don't want to request the
		// same id multiple times, we use an as a quick and dirty unique table
		pending[id] = defer;

		// kick off the request timer
		start();

		return cache[id].promise;
	};

	invalidate = function (id) {
		delete cache[id];
	};

	start = function () {
		// a process is already pending, just ignore the call
		if (fetching) {return;}

		fetching = setTimeout(fetch, options.timer);
	};

	fetch = function () {
		fetching = false;

		// get an array of all the ids we need to lookup
		var ids = _.keys(pending);

		while (ids.length) {
			buildProcess();
		}

		function buildProcess () {
			var id,
				expecting = {};

			if (!options.limit) {
				_.each(ids, function (id) {
					expecting[id] = pending[id];
					delete pending[id];
				});
				ids = [];
			} else if (typeof options.limit === 'number') {
				_.each(ids.splice(0, options.limit), function (id) {
					expecting[id] = pending[id];
					delete pending[id];
				});
			} else if (typeof options.limit === 'function') {
				do {
					// pluck an id off the stack
					id = ids.shift();
					expecting[id] = pending[id];
					delete pending[id];
				} while (!options.limit(_.keys(expecting)) && ids.length);
			}

			var resolve = function (id, value) {
				var defer = expecting[id] || cache[id];

				if (!defer) {
					console.error('request-buffer received a result for an id that was not requested.', id);
					return;
				}

				delete expecting[id];

				defer.resolve(value);
			};

			var reject = function (id, err) {
				var defer = expecting[id] || cache[id];

				if (!defer) {
					console.error('request-buffer received a rejection for an id that was not requested.', id);
					return;
				}

				delete expecting[id];

				defer.reject(err);
			};

			var rejectAll = function (err) {
				_.each(expecting, function (defer) {
					defer.reject(err);
				});
				expecting = {};
			};

			var done = function () {
				// loop through any remaining expected ids and resolve with undefined to indicate item was not found.
				_.each(expecting, function (defer) {
					defer.resolve(undefined);
				});
			};

			// Run the processor and pass in our callbacks for receiving results.
			try {
				options.processor(_.keys(expecting), resolve, reject, rejectAll, done);
			} catch (err) {
				rejectAll(err);
				return;
			}

		}

	};

	return {
		get: get,
		invalidate: invalidate
	};
};
