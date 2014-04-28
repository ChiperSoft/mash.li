
define(['lodash', 'backbone', 'events', 'visitor'], function (_, Backbone, events, visitor) {

	return Backbone.View.extend({
		initialize: function () {
			var data = {},
				attributes = this.$el[0].attributes,
				attribute, name,
				i = attributes.length;

			while (i--) {
				attribute = attributes.item(i);
				name = attribute.nodeName;

				if (name.indexOf('data-visitor-') === 0) {
					data[name.substring(13)] = attribute.nodeValue;
				}
			}

			visitor.set(data);

			if (data.ismoderator) {
				require(['js/lib/moderatorTools']);
			}
		}
	});

});
