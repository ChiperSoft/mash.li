
define(['lodash', 'backbone', 'events', './fill.hbs'], function (_, Backbone, events, tmplFill) {

	return Backbone.View.extend({
		template: tmplFill,
		currentList: null,
		featured: null,

		initialize: function () {
			var $script = this.$('script.list-data');

			this.currentList = $script.attr('data-currentlist');

			var json = $script.html();
			try {
				json = json && JSON.parse(json);
			} catch (e) {
				json = undefined;
			}

			this.featured = json;

			events.on({facetChange: '*'}, this.onFacetChange.bind(this));
		},

		onFacetChange: function (ev) {
			var listname = ev.value && ev.value.facets && ev.value.facets.list;

			if (!listname) {return;}

			this.currentList = listname;

			this.render();
		},

		render: function () {
			var data = {
				list: this.currentList,
				featuredLists: this.featured
			};

			var html = this.template(data);

			this.$('ul').html(html);

			return this;
		}
	});

});
