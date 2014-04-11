
var mongoose = require('app/db/mongo');

var sSoundCloudTrack = mongoose.Schema({
	_id: String,
	title: String,
	duration: Number,
	genre: String,
	tags: [String],
	permalink_url: String,
	uri: String,
	stream_url: String,
	artwork_url: String,
	user: {
		id: Number,
		username: String,
		uri: String,
		avatar_url: String,
		permalink_url: String
	},
	trackLink: { type: String, ref: 'Track'},
	created_at: { type: Date, default: Date.now },
	first_scanned_at: { type: Date, default: Date.now },
	last_scanned_at: Date
},
{
	strict: true
});

var SoundCloudTrack = mongoose.model('SoundCloudTrack', sSoundCloudTrack);

module.exports = SoundCloudTrack;
