var request = require('request');
var _ = require('lodash');
var when = require('when');
var config = require('app/config');

var URL_LIMIT = 1000;
var CACHE_TIMEOUT = 1000 * 60 * 60 * 6; //six hours
var cache = {};

var pending = {};
var pendingCount = 0;
var fetching;

function getTags(string) {
	var tags = [], tag;
	var regexp = /[^\s"']+|"([^"]*)"/g;
	while (tag = regexp.exec(string)) {
		tag = tag[1] || tag[0];
		if (tag.toUpperCase() !== 'MASHUP') {
			tags.push(tag);
		}
	}
	return tags;
}


function processResponse (err, tracks, expecting) {
	if (err) {
		console.error(err);
		_.each(expecting, function (junk, id) {
			cache[id].reject(err);
		});
		return;
	}

	_.each(tracks, function (track) {

		track.tags = track.tag_list && getTags(track.tag_list) || track.tags || [];
		if (track.artwork_url) {
			track.artwork_url = track.artwork_url.replace('-large', '-t300x300');
		}

		var defer = cache[track.id];
		if (!defer) {
			console.error('Received track we did not request.', track);
		}

		delete expecting[track.id];

		defer.resolve(track);
	});

	// loop through any remaining expected tracks and do false callbacks to indicate track was not found.
	_.each(expecting, function (junk, id) {
		var defer = cache[id];
		defer.resolve(false);
	});

}

function fetch () {
	fetching = false;

	var ids = _.keys(pending);

	function makeRequest () {
		var id = ids.shift(),
			expecting = {},
			url = 'https://api.soundcloud.com/tracks.json?client_id='+config.soundcloudKey+'&ids=' + id;

		expecting[id] = true;
		delete pending[id];

		while (url.length < URL_LIMIT && ids.length) {
			id = ids.shift();
			expecting[id] = true;
			delete pending[id];
			url += ',' + id;
		}

		request.get(url, {json:true}, function (err, response, tracks) {
			processResponse(err, tracks, expecting);
		});
	}

	while (ids.length) {
		makeRequest();
	}
}

function fetchDebounce() {
	// a fetch is already pending, just ignore
	if (fetching) {return;}

	fetching = setTimeout(fetch, 30);
}

module.exports = function (id) {
	// if we already have a stored promise for this cache item, and the promise
	// wasn't created more than CACHE_TIMEOUT ago, return it. Otherwise, re-download
	// the track data.
	if (cache[id] && Date.now() - cache[id].created < CACHE_TIMEOUT ) {
		return cache[id].promise;
	}

	cache[id] = when.defer();
	cache[id].created = Date.now();

	pending[id] = true;
	pendingCount++;

	fetchDebounce();

	return cache[id].promise;
};
