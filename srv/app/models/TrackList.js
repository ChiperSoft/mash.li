
var when = require('when');

var mongoose = require('app/db/mongo');
var Track = require('app/models/Track');

var sTrackList = mongoose.Schema({
	_id: String,
	tracks: [{ type: String, ref: 'Track' }],
	created_at: { type: Date, default: Date.now }
},{
	strict: true
});

var TrackList = mongoose.model('TrackList', sTrackList);

TrackList.promiseTrackList = function (name, options) {
	options = options || {};

	var p = TrackList.findOne({_id: name})
		.populate({
			path: 'tracks',
			match: {
				dead: {$ne: true},
				'flags.2': {$exists: false}
			}
		})
		.exec();

	if (options.asModels) {
		return when(p).then(function (tracklist) {
			return tracklist.tracks.slice(options.start, options.start + options.limit);
		});
	}

	return p.then(function (tracklist) {
		if (!tracklist || !tracklist.tracks || !tracklist.tracks.length) {
			return false;
		}

		return when.map(tracklist.tracks.slice(options.start, options.start + options.limit), function (model) {
			return model.promiseForRendering(options.visitorid);
		}).then(function (tracks) {
			return tracks.filter(function (o) { return o; });
		});
	});

};

TrackList.promiseTrackList['new'] = function (options) {
	options = options || {};

	var p = Track.find()
		.sort({created_at: -1, _id: 1})
		.where('dead').ne(true)          // ignore tracks marked as dead
		.where('flags.2').exists(false)  // ignore tracks with three or more flags
		.where('flags.visitorId').nin([options.visitorid]) //ignore tracks the visitor flagged
		.skip(options.start)
		.limit(options.limit)
		.exec();

	if (options.asModels) {
		return when(p);
	}

	return when.map(when(p), function (model) {
		return model.promiseForRendering(options.visitorid);
	}).then(function (tracks) {
		return tracks.filter(function (o) { return o; });
	});
};

TrackList.promiseTrackList.empty = function () {
	return when([]);
};

TrackList.promiseTrackList.steam = function (options) {
	options = options || {};

	var p = Track.find()
		.sort({created_at: -1, _id: 1})
		.where('dead').ne(true)          // ignore tracks marked as dead
		.where('flags.2').exists(false)  // ignore tracks with three or more flags
		.where('flags.visitorId').nin([options.visitorid]) //ignore tracks the visitor flagged
		.exec();

	return when(p).then(function (tracks) {
		return tracks.map(function (o) {
			o.temperature = o.getVoteData().temperature;
			return o;
		}).sort(function (a, b) {
			return b.temperature - a.temperature;

		}).slice(options.start, options.start + options.limit);

	}).then(function (tracks) {
		return when.map(tracks, function (model) {
			// return model.toObject();
			return model.promiseForRendering(options.visitorid);
		});
	});
};


TrackList.promiseTotalTracks = function (name) {
	var p = TrackList.findOne({_id: name}).exec();

	return when(p).then(function (tracklist) {
		return tracklist && tracklist.tracks.length || 0;
	});
};

TrackList.promiseTotalTracks['new'] = function (options) {
	var p = Track.find({})
		.where('dead').ne(true)          // ignore tracks marked as dead
		.where('flags.2').exists(false)  // ignore tracks with three or more flags
		.where('flags.visitorId').nin([options.visitorid]) //ignore tracks the visitor flagged
		.count().exec();

	return when(p);
};

TrackList.promiseTotalTracks.empty = function () {
	return when.resolve(0);
};

TrackList.promiseTotalTracks.steam = function (options) {
	return TrackList.promiseTotalTracks['new'](options);
};

module.exports = TrackList;
