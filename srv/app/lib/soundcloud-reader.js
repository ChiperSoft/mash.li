var request = require('request');
var qss = require('querystring').stringify;
var Readable = require('stream').Readable;
var moment = require('moment');
var util = require('util');
var log = require('app/log');

var config = require('app/config');


function getPage (limit, offset, since, callback) {

	var args = {
		client_id: config.soundcloudKey,
		filter: 'streamable',
		tags: 'mashup'
	};

	if (limit)  {args.limit = limit;}
	if (offset) {args.offset = offset;}

	var url = 'https://api.soundcloud.com/tracks.json?'+qss(args);

	if (since) {
		url += '&created_at[from]=' + moment(since).format('YYYY-MM-DD HH:mm:ss');
	}


	request.get(url, {json:true}, callback);
}


function ResultsStream (maxResults, since) {
	Readable.call(this, { objectMode: true });

	this.pageSize = 0;
	this.pageOffset = 0;
	this.pageReading = false;
	this.maxResults = maxResults || 0;
	this.since = since || false;
	this.highWaterMark = 0;
}

util.inherits(ResultsStream, Readable);

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
			if (body.errors && body.errors.length) {
				log({
					level: 1,
					name: 'ERROR!',
					status: 'SoundCloud call returned errors',
					source: JSON.stringify(body.errors, undefined, 2),
					warn: true
				});
				self.emit('error', true);
			} else {
				self._processPage(body);
			}
		} else {
			log({
				level: 1,
				name: 'ERROR!',
				status: 'SoundCloud call returned with a non 200 status',
				id: response.statusCode,
				warn: true
			});
			self.emit('error', true);
		}
	});
};

ResultsStream.prototype._processPage = function (results) {
	var self = this,
		i = 0,
		c = results && results.length,
		row;

	process.stdout.write('Received ' + (c||0) + ' Results');

	log({
		level: 4,
		name: 'Received ' + (c||0) + ' Results',
		warn: true
	});

	if (c) {
		while (i < c) {
			process.stdout.write('.');
			this.pageOffset++;
			row = results[i];
			if (row) {this.push(row);}
			i++;
		}
		process.stdout.write('\n');

		if (this.maxResults && this.pageOffset >= this.maxResults) {
			this.emit('end');
		} else {
			this._grabPage();
		}
	} else {
		process.stdout.write('\n');
		self.emit('end');
	}
};

module.exports = ResultsStream;