
// This module works by taking advantage of a feature of promises, that if a promise is already resolved
// then it will instantly call any onResolved function that gets added with .then().  Any time a request
// is made for a track we don't have yet, we store the deferral that gets created for the request and
// reuse that deferral's promise for all subsequent requests of the same track id.

// This module performs request pooling. The module is invoked for single tracks, but to avoid making
// dozens of individual http requests, we collect multiple ids together and request them all at once.
// This is done by putting the actual http request on a setTimeout of 30ms.  The first request kicks
// off the timer and until that timer expires all other calls to make the request are ignored.

// load dependencies and the app configuration
var request = require('request');
var _ = require('lodash');
var when = require('when');
var config = require('app/config');

// define constants
var URL_LIMIT = 1900;
var CACHE_TIMEOUT = 1000 * 60 * 60 * 6; //six hours
var DEBOUNCE_TIMER = 30;
var MAX_TRACKS = 40;

var cache = {};
var pending = {};
var fetching;

module.exports = function (id) {
	// if we already have a stored promise for this cache item, and the promise
	// wasn't created more than CACHE_TIMEOUT ago, return it.
	if (cache[id] && Date.now() - cache[id].created < CACHE_TIMEOUT ) {
		return cache[id].promise;
	}

	// create a new deferral and store it in the cache, with a creation date
	cache[id] = when.defer();
	cache[id].created = Date.now();

	// add the request id to the pending requests collection since we don't want to request the
	// same id multiple times, we use an as a quick and dirty unique table
	pending[id] = true;

	// kick off the request timer
	fetchDebounce();

	return cache[id].promise;
};


function fetchDebounce() {
	// a fetch is already pending, just ignore the call
	if (fetching) {return;}

	fetching = setTimeout(fetch, DEBOUNCE_TIMER);
}

function fetch () {
	fetching = false;

	// get an array of all the track ids we need to lookup
	var ids = _.keys(pending);

	while (ids.length) {
		makeRequest();
	}

	// There is a physical limit to the maximum length of a url (roughly 2000 characters).  In practical use
	// we should never be requesting enough tracks to overflow this (that'd be about 175 ids at once), but
	// one never knows...  Additionally, soundcloud's docs are unclear about how many tracks we can request
	// at once. Searches default to 50 results per page, but for safety sake we cap it at 40 (MAX_TRACKS).

	function makeRequest () {
		var id,
			expecting = {},
			trackCount = 0,
			url = 'https://api.soundcloud.com/tracks.json?client_id='+config.soundcloudKey+'&ids=';

		do {
			// pluck an id off the stack
			id = ids.shift();

			// record that we're expecting that id in the response. We do this because if a track is deleted,
			// soundcloud doesn't tell us, it just doesn't include that track in the results.
			expecting[id] = true;

			// remove this id from the pending table
			delete pending[id];

			// append the id to the url
			url += ',' + id;

			// count how many tracks we've added to this request
			trackCount++;

		} while (trackCount < MAX_TRACKS && url.length < URL_LIMIT && ids.length);

		// make the http request.  pass the results, along with what tracks we were expecting from this request,
		// to the response handler.
		request.get(url, {json:true}, function (err, response, tracks) {
			processResponse(err, tracks, expecting);
		});
	}

}


function processResponse (err, tracks, expecting) {
	// if the request failed, reject all the track promises for tracks we were expecting in that request
	if (err) {
		console.error(err);
		_.each(expecting, function (junk, id) {
			cache[id].reject(err);
		});
		return;
	}

	// for each track we get back...
	_.each(tracks, function (track) {

		// parse the tags list into something usable
		track.tags = track.tag_list && getTags(track.tag_list) || track.tags || [];

		// convert the artwork url to the largest size we need (for the songbar)
		if (track.artwork_url) {
			track.artwork_url = track.artwork_url.replace('-large', '-t300x300');
		}

		var defer = cache[track.id];
		if (!defer) {
			console.error('Received track we did not request.', track);
		}

		// remove this track from the expecting list
		delete expecting[track.id];

		// resolve the promise for this track
		defer.resolve(track);
	});

	// loop through any remaining expected tracks and resolve with false to indicate track was not found.
	_.each(expecting, function (junk, id) {
		var defer = cache[id];
		defer.resolve(false);
	});

}

function getTags(string) {
	var tags = [], tag;
	var regexp = /[^\s"']+|"([^"]*)"/g;
	while (tag = regexp.exec(string)) {
		tag = tag[1] || tag[0];

		// filter the mashup tag, since its implied
		if (tag.toUpperCase() !== 'MASHUP') {
			tags.push(tag);
		}
	}
	return tags;
}

