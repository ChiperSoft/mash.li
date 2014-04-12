var when = require('when');
var decay = require('decay').wilsonScore();
var log = require('app/log');

var Track = require('app/models/Track');
var TrackList = require('app/models/TrackList');

module.exports = function () {

	var p = Track.find()
		.sort({created_at: -1, _id: 1})
		.where('dead').ne(true)
		.exec();

	return when(p).then(function (tracks) {
		return tracks
			.map(function (o) {
				var track = o.toObject();
				track.votes = o.getVoteData();
				track.temperature = decay(track.votes.upReal, track.votes.downReal, o.created_at);
				return track;
			})
			.sort(function (a, b) {
				return b.temperature - a.temperature;

			})
			.slice(0, 100)
			.map(function (o) {
				// log({
				// 	name: o.details.title,
				// 	id: o._id,
				// 	status: o.temperature
				// });
				return o._id;
			});
	}).then(function (ids) {
		log({
			level: 6,
			name: 'Updating best list'
		});

		return TrackList.update({_id: 'best'}, {tracks: ids}, {upsert: true}).exec();
	});

};
