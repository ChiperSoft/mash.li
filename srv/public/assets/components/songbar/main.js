
define(['lodash', 'backbone', 'events', 'models/Track', './songDetails.hbs'], function (_, Backbone, events, Track, tmplDetails) {

	return Backbone.View.extend({
		template: tmplDetails,

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
			}

			this.render = this.render.bind(this);

			events.on('track', this.onTrackEvent, this);
		},

		onTrackEvent: function (event, id) {
			$('#splitview').toggleClass('songbar-open', !!id);
			if (id && (!this.model || this.model.id !== id)) {
				if (this.model) {
					this.stopListening(this.model);
				}
				this.model = new Track({id: id});
				this.listenTo(this.model, 'sync', this.render);
				this.render();
			}
		},

		render: function () {
			var data = { track: this.model.toJSON() };

			var html = this.template(data);

			this.$('.body').html(html);

			return this;
		}
	});

});