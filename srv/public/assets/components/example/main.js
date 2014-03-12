/* globals alert */
define(['backbone', './frontend.hbs'], function (Backbone, tmpl) {

	var ExampleComponent = Backbone.View.extend({
		events: {
			'click button' : 'buttonClicked'
		},

		options: {
			message: 'Original message'
		},

		initialize: function () {
			this.options.message = this.$el.attr('data-message') || this.options.message;
			this.render();
		},

		buttonClicked: function () {
			alert(this.options.message);
		},

		render: function () {
			this.$el.html(tmpl({
				titleText: 'This is my spout.',
				buttonText: 'This is my handle.'
			}));
		}
	});

	return ExampleComponent;
});
