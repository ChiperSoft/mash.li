require('app/models/Track');
var proxmis = require('proxmis');
var mongoose = require('app/db/mongo');

var sTrackVote = mongoose.Schema({
	track: { type: String, ref: 'Track' },
	visitorId: String,
	ipHash: String,
	delta: { type: Number, default: 0 },
	trusted: Boolean,
	created_at: { type: Date, default: Date.now },
},{
	strict: true
});

sTrackVote.index({track: 1, visitorId: 1});
sTrackVote.index({visitorId: 1});

var TrackVote = mongoose.model('TrackVote', sTrackVote);

TrackVote.promisePreviousVote = function (track, visitorid) {
	return TrackVote.findOne({track: track, visitorId: visitorid}).exec();
};

TrackVote.promiseTotalPriorVotesForVisitor = function (visitorid, before) {
	var p = proxmis();
	var q = TrackVote.find({visitorId: visitorid});

	if (before) {
		q.where('created_at').lte(before);
	}

	q.count(p);

	return p;
};

TrackVote.promiseTotalRecentTrackVotesForIP = function (track, ipHash, after) {
	var p = proxmis();
	var q = TrackVote.find({track: track, ipHash: ipHash});

	if (after) {
		q.where('created_at').gt(after);
	}

	q.count(p);

	return p;
};

TrackVote.promiseTotalPriorVotesForIP = function (ipHash) {
	var p = proxmis();
	TrackVote.find({ipHash: ipHash}).count(p);
	return p;
};

module.exports = TrackVote;
