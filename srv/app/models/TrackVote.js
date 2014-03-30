require('app/models/Track');
var proxmis = require('proxmis');
var mongoose = require('app/db/mongo');

var sTrackVote = mongoose.Schema({
	track: { type: String, ref: 'Track' },
	visitorHash: String,
	delta: Number,
	created_at: { type: Date, default: Date.now },
},{
	strict: true
});

sTrackVote.index({track: 1, visitorHash: 1}, {unique: true});

var TrackVote = mongoose.model('TrackVote', sTrackVote);

TrackVote.promisePreviousVote = function (track, hash) {
	var p = proxmis();
	TrackVote.findOne({track: track, visitorHash: hash}).sort('-created_at').exec(p);
	return p;
}

module.exports = TrackVote;