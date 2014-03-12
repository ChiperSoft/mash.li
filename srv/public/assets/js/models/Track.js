
define(['lodash', 'backbone', 'soundcloud', 'models/SCTrack'], function (_, Backbone, soundcloud, SCTrack) {

	var trackCache = {};

	var Track = Backbone.Model.extend({
		className: 'Track',
		idAttribute: '_id',

		set: function(attributes, options) {
			// If we pass in nodes collection JSON array and this model has a nodes attribute
			// Assume we already set it as a collection
			if (_.has(attributes, 'details') && this.get("details")) {
				this.get('details').reset(attributes.details);
				delete attributes.details;
			} else if (_.has(attributes, 'details') && !this.get('details')) {
				var m = new SCTrack(attributes.details);
				this.set('details', m);
				this.listenTo(m, 'all', this._onSubModelEvent);
				delete attributes.details;
			}

			return Backbone.Model.prototype.set.call(this, attributes, options);
		},

		_onSubModelEvent: function(event) {
			if (event === 'add' || event === 'remove' || event.substring(0, 7) === 'change:') {return;}
			this.trigger.apply(this, arguments);
		},

		toJSON: function() {
			var data = _.clone(this.attributes);
			data.details = data.details.toJSON();
			return data;
		}
	});

	return function (attributes, options) {
		options = options || {};
		if (!attributes || (!attributes.id && !attributes._id)) {
			throw new Error('Track cannot be initialized without an id.');
		}

		// if we're getting a model from mangodb, convert the id.
		if (!attributes.id && attributes._id) {
			attributes.id = attributes._id;
		}

		var id = attributes.id, track;

		if (typeof trackCache[id] !== 'undefined') {
			// we have the track already cached.
			track = trackCache[id];
			if (options.overwrite) {
				track.reset(attributes);
			}
		} else {
			track = trackCache[id] = new Track(attributes, options);
		}

		return track;
	};
});