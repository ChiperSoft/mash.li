define(['lodash', 'backbone', 'events', 'collections/TrackList', './fill.hbs'], function (_, Backbone, events, TrackList, tmplListContents) {

	return Backbone.View.extend({
		template: tmplListContents,
		lastPlayed: false,
		nowPlaying: false,

		initialize: function () {
			var $script = this.$('script.list-data');
			var json = $script.html();
			this.lastPlayed = $script.attr('data-last-played');
			this.isModerator = $script.attr('data-ismoderator') || false;

			try {
				json = json && JSON.parse(json);
			} catch (e) {
				json = undefined;
			}

			if (json === undefined) {
				console.error('Could not parse list data for component/tracklist');
				return;
			}

			this.collection = new TrackList(json, {
				name: $script.attr('data-listname'),
				start: parseInt($script.attr('data-start'), 10),
				limit: parseInt($script.attr('data-limit'), 10),
				total: parseInt($script.attr('data-total'), 10)
			});

			this.listenTo(this.collection, 'sync', this.render);
			this.listenTo(this.collection, 'change', this.render);

			this.render = _.debounce(this.render.bind(this), 50);

			this.listenTo(events, 'player:playing', this.onPlayback);
			this.listenTo(events, 'player:paused', this.onPaused);

			events.on({facetChange: '*'}, this.onFacetChange.bind(this));
			events.on('track:hide', this.onTrackHide.bind(this));

			// this.render();
		},

		events: {
			'click .vote a': 'onVote'
		},

		seekPage: function (name, start, limit) {
			start = Math.max(start, 0);

			this.stopListening(this.collection);
			this.collection = new TrackList([], {
				name: name,
				start: start,
				limit: limit
			});

			if (!this.collection.length) {
				this.loading = true;
				this.collection.fetch();
				this.collection.once('sync', function () {
					this.loading = false;
				}.bind(this));
			}

			this.listenTo(this.collection, 'sync', this.render);
			this.listenTo(this.collection, 'change', this.render);

			this.render();
		},

		onFacetChange: function (ev) {
			var facets = ev.value.facets,
				listname = facets.list || this.collection.name,
				startFacet = (parseInt(facets.start, 10) || 1) - 1,
				limitFacet = parseInt(facets.limit, 10) || this.collection.limit;

			if (listname !== this.collection.name || startFacet !== this.collection.start || limitFacet !== this.collection.limit) {
				this.seekPage(listname, startFacet, limitFacet);
				window.scrollTo(0,0);
			}
		},

		onTrackHide: function (ev, id) {
			this.$('[data-trackid="' + id + '"]').slideUp(200);
			var track = this.collection.get(id);

			if (track) {
				track.set({hidden: true}, {silent: true});
			}
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
				$currentVote = $track.find('.vote .current');

			var trackID = $track.attr('data-trackid'),
				track = this.collection.get(trackID),
				targetDelta = parseInt($targetVote.attr('data-delta'),10),
				currentDelta = parseInt($currentVote.attr('data-delta'),10) || 0,
				currentScore = track.get('score'),
				targetScore;

			if (targetDelta !== currentDelta) {
				targetScore = currentScore + (targetDelta - currentDelta);

				track.set({score: targetScore, voted: targetDelta});

				var url = $targetVote.attr('data-url');

				$.ajax({
					url: url,
					type: "POST",
					dataType: 'json'
				});

				if (window.ga) {
					ga('send', 'pageview', url);
				}
			}

		},

		render: function () {
			var data;
			if (this.loading) {
				data = {loading: true};
			} else {
				var page = {
					list: this.collection.name,
					start: this.collection.start,
					limit: this.collection.limit,
					total: this.collection.total,
					stop: Math.min(this.collection.start + this.collection.limit, this.collection.total),
					prevPage: Math.max(0, this.collection.start - this.collection.limit)
				};

				if (page.stop < page.total) {
					page.nextPage = page.stop;
				} else {
					page.nextPage = false;
				}

				data = {
					isModerator: this.isModerator,
					tracks: this.collection.toJSON(),
					lastPlayed: this.lastPlayed,
					nowPlaying: this.nowPlaying,
					page: page
				};
			}

			var html = this.template(data);

			this.$('ul.lbody').html(html);

			return this;
		}
	});

});
