
define(['lodash', 'backbone', 'events'], function (_, Backbone, events) {

	return Backbone.View.extend({
		trackid: null,

		initialize: function () {
			events.on('track:flag', this.onFlagEvent.bind(this));
		},

		events: {
			'click .btn-default, .close': 'hide',
			'click .btn-primary': 'onSubmit',
			'hidden': 'onDismissed'
		},

		onFlagEvent: function (ev, id) {
			this.trackid = id;
			this.show();
		},

		onSubmit: function () {
			var $helpBlock = this.$('.help-block');
			var spinner = this.$('.btn-primary').addClass('has-spinner');
			var self = this;
			var trackid = this.trackid;

			$.ajax('/flag/' + trackid + '/', {
				type: 'POST',
				dataType: 'json'
			}).fail(function () {
				$helpBlock.text('An error occurred while communicating with the server.');
			}).done(function (response) {
				if (!response.success) {
					$helpBlock.text(response.error);
				} else {
					self.hide();
					events.trigger('track:hide', trackid);
				}
			}).always(function () {
				spinner.removeClass('has-spinner');
			});
		},

		onDismissed: function () {
			this.trackid = null;
		},

		show: function () {
			this.$el.modal();
		},

		hide: function () {
			this.$el.modal('hide');
		}
	});

});
