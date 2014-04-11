define(['lodash', 'backbone', 'models/Track', 'pinvault'], function (_, Backbone, Track, pinvault) {

	var TrackList = Backbone.Collection.extend({
		className: 'TrackList',
		model: Track,

		initialize: function (data, options) {
			this.name = options.name;
			this.start = options.start;
			this.limit = options.limit;
			this.total = options.total;
		},

		url: function () {
			return '/list/' + this.name + '/start/' + (this.start + 1) + '/limit/' + this.limit;
		},

		parse: function (data) {
			this.start = data.start;
			this.total = data.total;
			return data.tracks;
		}
	});

	var vault = pinvault();

	return function (data, options) {
		options = options || {};

		var signature = [
			options.name,
			options.limit,
			options.start
		];

		var existing = vault.get(signature);

		if (!existing) {
			existing = new TrackList(data, options);
			vault.add(signature, existing);
		}

		return existing;
	};
});
