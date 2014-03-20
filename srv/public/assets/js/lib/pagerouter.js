

define(['lodash', 'backbone', 'events'], function (_, Backbone, events) {

	var Router = Backbone.Router.extend({

		routes: {
			"track/:id(/*subsection)": 'track'
		},

		initialize: function () {
			this.route(/^\/?$/, 'track', this.track);
		},

		track: function (id, command) {
			command = command && 'track:' + command.replace('/', ':') || 'track';
			events.trigger(command, id);
		}
	});

	var router = new Router();

	Backbone.history.start({root: '/', pushState: true});

	$(document).on('click', 'a[href]:not([data-bypass]):not([href^="http"])', function (evt) {

		var href = $(this).attr('href');
		var protocol = this.protocol + '//';

		if (href.slice(protocol.length) !== protocol) {
			evt.preventDefault();
			router.navigate(href, true);

			if (window.ga) {
				ga('send', 'pageview', href);
			}
		}
	});

	return router;
});