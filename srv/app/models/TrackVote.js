
var mongoose = require('app/db/mongo');

var sTrackVote = mongoose.Schema({
	scTrack: { type: String, ref: 'SoundCloudTrack' },
	created_at: { type: Date, default: Date.now },
},{
	strict: true
});

var TrackVote = mongoose.model('Track', sTrackVote);

module.exports = TrackVote;