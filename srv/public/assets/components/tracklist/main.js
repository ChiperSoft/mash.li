
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

			this.render = _.debounce(this.render.bind(this), 50);

			this.listenTo(this.collection, 'sync', this.render);
			this.listenTo(this.collection, 'change', this.render);

			this.listenTo(events, 'player:playing', this.onPlayback);
			this.listenTo(events, 'player:paused', this.onPaused);
		},

		events: {
			'click .vote a': 'onVote'
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

		onVote: function (ev) {
			ev.preventDefault();
			ev.stopPropagation();

			var $targetVote = $(ev.currentTarget),
				$track = $targetVote.parents('li'),
				$currentVote = $track.find('.vote .current'),
				$currentScore = $track.find('.vote .score');

			var trackID = $track.attr('data-trackid'),
				track = this.collection.get(trackID),
				targetDelta = parseInt($targetVote.attr('data-delta'),10),
				currentDelta = parseInt($currentVote.attr('data-delta'),10) || 0,
				currentScore = track.get('score'),
				targetScore;

			if (targetDelta !== currentDelta) {
				targetScore = currentScore + (targetDelta - currentDelta);

				track.set({score: targetScore, voted: targetDelta});

				// $.getJSON($targetVote.attr('href'));
			}

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