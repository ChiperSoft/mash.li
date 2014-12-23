// soundcloud-reader is a node stream which reads pages from the soundcloud api and outputs them one track
// at a time.  This library went through several iterations as I tried to make streams work using the
// node.js examples and documentation, but the stream did not behave as the docs suggested, so I had
// to improvise.  In the end I settled on just dumping as many results as I could get to the stream
// as fast as I got them, and let the stream handle back-pressure itself.

var request = require('request');
var qss = require('qs').stringify;
var Readable = require('stream').Readable;
var moment = require('moment');
var util = require('util');
var log = require('app/log');

var config = require('app/config');


function ResultsStream (since) {
	Readable.call(this, { objectMode: true });

	this.pageSize = 200;
	this.pageOffset = 0;
	this.pageReading = false;
	this.maxResults =  8000;
	this.since = since || false;
	this.highWaterMark = 0;
	this.errorCount = 0;
}

util.inherits(ResultsStream, Readable);

module.exports = ResultsStream;

ResultsStream.prototype._read = function () {
	if (this.pageReading) {
		return;
	}
	this.pageReading = true;
	this._grabPage();
};

ResultsStream.prototype._grabPage = function () {
	var self = this;
	getPage(self.pageSize, self.pageOffset, self.since, function (err, response, body) {
		if (response.statusCode === 200) {
			this.errorCount = 0;
			if (body.errors && body.errors.length) {
				log({
					name: 'SoundCloud call returned errors',
					source: 'soundcloud-reader',
					error: body.errors
				});
				self.emit('error', true);
			} else {
				self._processPage(body);
			}
		} else {
			log({
				level: 1,
				source: 'soundcloud-reader',
				name: 'SoundCloud call returned with a non 200 status',
				id: response.statusCode,
				error: body.errors
			});
			this.errorCount++;
			if (this.errorCount > 5) {
				self.emit('error', true);
				log({
					level: 1,
					name: 'Reached 5 errors, quitting.',
					id: response.statusCode,
					error: body.errors
				});

			} else {
				setTimeout(self._grabPage.bind(self), 5000);
				log({
					level: 4,
					name: 'Retrying last request.',
					id: response.statusCode,
					errpr: body.errors,
				});
			}
		}
	});
};

ResultsStream.prototype._processPage = function (results) {
	var self = this,
		i = 0,
		c = results && results.length,
		row,
		since = this.since && moment(since);

	log({
		level: 4,
		name: 'Received ' + (c||0) + ' Results',
		error: true
	});

	if (c) {
		while (i < c) {
			this.pageOffset++;
			row = results[i];

			//if the track we got was older than our "since" date, we've run out of new tracks and can stop iterating.
			// if (row && since && moment(row.created_at) < since) {
			// 	this.push(null);
			// 	process.stdout.write('\n');
			// 	return;
			// }

			if (row) {this.push(row);}
			i++;
		}

		if (!c || (this.maxResults && this.pageOffset >= this.maxResults)) {
			this.push(null);
		} else {
			setTimeout(this._grabPage.bind(this), 5000);
		}
	} else {
		process.stdout.write('\n');
		self.push(null);
	}
};

function getPage (limit, offset, since, callback) {

	var args = {
		client_id: config.soundcloudKey,
		filter: 'streamable',
		tags: 'mashup',
		order: 'created_at'
	};

	if (limit)  {args.limit = limit;}
	if (offset) {args.offset = offset;}

	var url = 'https://api.soundcloud.com/tracks.json?' + qss(args);

	// if (since) {
	// 	url += '&created_at[from]=' + moment(since).format('YYYY-MM-DD') + '00:00:00 +0000';
	// }

	console.log(url);

	request.get(url, {json: true}, callback);
}
