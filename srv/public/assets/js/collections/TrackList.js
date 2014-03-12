
define(['lodash', 'backbone', 'models/Track'], function (_, Backbone, Track) {

	var TrackList = Backbone.Collection.extend({
		className: 'TrackList',
		model: Track
	});

	return TrackList;
});