
define(['lodash', 'backbone', 'events', 'models/Track', './songDetails.hbs'], function (_, Backbone, events, Track, tmplDetails) {

	return Backbone.View.extend({
		template: tmplDetails,
		lastHeight: 0,

		initialize: function () {
			var json = this.$('script.track-data').html();
			try {
				json = json && JSON.parse(json) || false;
			} catch (e) {
				json = false;
			}

			if (json) {
				this.model = new Track(json);
				this.listenTo(this.model, 'sync', this.render);
				this.listenTo(this.model, 'change', this.render);
			}

			this.render = this.render.bind(this);

			events.on('track', this.onTrackEvent, this);

			$(window).on('resize scroll', this.onPageScroll.bind(this));
			this.updateDetailHeight();
			
		},

		events: {
			'click .vote a': 'onVote'
		},

		onPageScroll: function () {
			// no need to update the view height if the drawer is hidden
			if (!this.model) {return;}
			this.updateDetailHeight();
		},

		// Find the space between the top of the details view and both the bottom of the window
		// or the top of the footer, and sets the details view height to the smaller of the two.
		// This makes sure the view has a scrollbar when needed.
		updateDetailHeight: function (force) {
			var $details = this.$('.details');

			if (!$details.length) {return;}

			var pageScroll = $(window).scrollTop(),
				detailsTop = $details.position().top + this.$('.body').position().top,
				footerTop = $('footer').offset().top,
				viewHeight = $(window).height(),
				height = Math.min(footerTop - pageScroll - detailsTop, viewHeight - detailsTop)
			;

			// check for changes so that we can avoid unnecessary redraws
			if (force || height !== this.lastHeight) {
				this.lastHeight = height;
				$details.css('height', height);
			}

		},

		onVote: function (ev) {
			ev.preventDefault();
			ev.stopPropagation();

			var $targetVote = $(ev.currentTarget),
				$currentVote = this.$('.vote .current');

			var track = this.model,
				targetDelta = parseInt($targetVote.attr('data-delta'),10),
				currentDelta = parseInt($currentVote.attr('data-delta'),10) || 0,
				currentScore = track.get('score'),
				targetScore;

			if (targetDelta !== currentDelta) {
				targetScore = currentScore + (targetDelta - currentDelta);

				track.set({score: targetScore, voted: targetDelta});

				var url = $targetVote.attr('href');

				$.getJSON(url);

				if (window.ga) {
					ga('send', 'pageview', url);
				}
			}

		},

		onTrackEvent: function (event, id) {
			$('#splitview').toggleClass('songbar-open', !!id);
			if (id && (!this.model || this.model.id !== id)) {
				if (this.model) {
					this.stopListening(this.model);
				}
				this.model = new Track({id: id});
				this.listenTo(this.model, 'sync', this.render);
				this.listenTo(this.model, 'change', this.render);
				this.render();
			} else if (!id) {
				this.model = null;
			}
		},

		render: function () {
			var data = { track: this.model.toJSON() };

			if (!data.track.details) {
				data.track = false;
			}

			var html = this.template(data);

			this.$('.body > div').html(html);

			this.updateDetailHeight(true);

			return this;
		}
	});

});