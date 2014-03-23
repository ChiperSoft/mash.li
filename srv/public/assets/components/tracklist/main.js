
define(['lodash', 'backbone', 'events', 'collections/TrackList', './fill.hbs'], function (_, Backbone, events, TrackList, tmplListContents) {

	return Backbone.View.extend({
		template: tmplListContents,
		lastPlayed: false,
		nowPlaying: false,

		initialize: function () {
			var json = this.$('script.list-data').html();
			this.lastPlayed = this.$('script.list-data').attr('data-last-played');
			try {
				json = json && JSON.parse(json) || false;
			} catch (e) {
				json = false;
			}

			if (!json) {
				console.error('Could not parse list data for component/tracklist');
				return;
			}

			this.collection = new TrackList(json);

			this.render = this.render.bind(this);

			this.listenTo(this.collection, 'sync', _.debounce(this.render, 200));

			this.listenTo(events, 'player:playing', this.onPlayback);
			this.listenTo(events, 'player:paused', this.onPaused);
		},

		onPlayback: function (ev, id) {
			this.lastPlayed = id;
			this.nowPlaying = id;
			this.render();
		},

		onPaused: function () {
			this.nowPlaying = false;
			this.render();
		},


		render: function () {
			var data = {
				tracks: this.collection.toJSON(),
				lastPlayed: this.lastPlayed,
				nowPlaying: this.nowPlaying
			};

			var html = this.template(data);

			this.$('ul.lbody').html(html);

			return this;
		}
	});

});