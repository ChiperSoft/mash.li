
var proxmis = require('proxmis');
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
			options: {
				skip: options.start,
				limit: options.limit
			}
		})
		.exec();

	p = p.then(function (tracklist) {
		if (!tracklist) {
			return false;
		}

		var p2 = proxmis();
		Track.populate(tracklist.tracks, {path: 'details'}, p2);

		return when(p2).then(function () {
			return tracklist;
		});
	});

	if (options.asModels) {
		return when(p);
	}

	return p.then(function (tracklist) {
		if (!tracklist || !tracklist.tracks || !tracklist.tracks.length) {
			return false;
		}

		return when.map(tracklist.tracks, function (model) {
			return model.promiseForRendering(options.visitorid);
		});
	});

};

TrackList.promiseTrackList['new'] = function (options) {
	options = options || {};

	var p = Track.find()
		.populate('details')
		.sort('-created_at')
		.skip(options.start)
		.limit(options.limit)
		.exec();

	if (options.asModels) {
		return when(p);
	}

	return when.map(when(p), function (model) {
		return model.promiseForRendering(options.visitorid);
	});
};

TrackList.promiseTrackList.empty = function () {
	return when([]);
};


TrackList.promiseTotalTracks = function (name) {
	var p = TrackList.findOne({_id: name}).exec();

	return when(p).then(function (tracklist) {
		return tracklist.tracks.length;
	});
};

TrackList.promiseTotalTracks['new'] = function () {
	var p = Track.find({}).count().exec();

	return when(p);
};

TrackList.promiseTotalTracks.empty = function () {
	return when.resolve(0);
};


module.exports = TrackList;