
var mongoose = require('app/db/mongo');
var moment = require('moment');
var proxmis = require('proxmis');

var sTrack = mongoose.Schema({
	_id: String,
	details: { type: String, ref: 'SoundCloudTrack' },
	created_at: { type: Date, default: Date.now },
},{
	strict: true
});

var Track = mongoose.model('Track', sTrack);

Track.promiseForListNew = function (callback) {
	require('app/models/SoundCloudTrack');
	var p = proxmis(callback);
	Track.find()
		.populate('details')
		.where('created_at')
			.gte(moment().subtract('days', 1).startOf('day').toDate()) //yesterday morning
			.lte(moment().endOf('day').toDate()) //tonight
		.sort('-created_at')
		.exec(p);
	return p;
};


Track.promiseForID = function (id, callback) {
	require('app/models/SoundCloudTrack');
	var p = proxmis(callback);
	Track.findOne({_id: id})
		.populate('details')
		.exec(p);
	return p;
};

module.exports = Track;