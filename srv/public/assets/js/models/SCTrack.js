
define(['lodash', 'backbone', 'soundcloud'], function (_, Backbone, soundcloud) {

	
	var TrackLoader = {
		URL_LIMIT: 1000,
		_waiting: {},
		_requesting: [],
		
		_responseCallback: function (tracks, err, expecting) {
			if (err || !_.isArray(tracks)) {
				TrackLoader._onError('Soundcloud did not respond with a tracks array.', tracks, err);
				return;
			}

			_.each(tracks, function (track) {
				var callbacks = TrackLoader._waiting[track.id];
				if (!callbacks) {
					TrackLoader._onError('Received track we did not request.');
				}

				delete TrackLoader._requesting[track.id];
				delete TrackLoader._waiting[track.id];
				delete expecting[track.id];

				_.each(callbacks, function (cb) {
					try {
						cb(track);
					} catch (e) {
						TrackLoader._onError(e);
					}
				});
			});

			// loop through any remaining expected tracks and do false callbacks to indicate track was not found.
			_.each(expecting, function (junk, id) {
				var callbacks = TrackLoader._waiting[id];
				_.each(callbacks, function (cb) {
					try {
						cb(false);
					} catch (e) {
						TrackLoader._onError(e);
					}
				});
			});
		},

		_fetch: _.debounce(function () {
			var ids = _.keys(TrackLoader._requesting);

			while (ids.length) {
				(function () {
					var id = ids.shift(),
						expecting = {},
						url = '/tracks?ids=' + id;

					expecting[id] = true;

					while (url.length < TrackLoader.URL_LIMIT && ids.length) {
						url += ',' + ids.shift();
					}

					soundcloud.get(url, function (tracks, err) {
						TrackLoader._responseCallback(tracks, err, expecting);
					});
				})();
			}
		}, 300),

		getTrack: function (id, callback) {
			// push the callback onto the waiting stack, under the track's id.
			(TrackLoader._waiting[id] || (TrackLoader._waiting[id] = [])).push(callback);

			// add the id onto the hash of ids to fetch
			TrackLoader._requesting[id] = true;

			// kick off the request
			TrackLoader._fetch();
		},

		_onError: function () {
			console.warn.apply(console, arguments);
		}
	};


	
	var SCTrack = Backbone.Model.extend({
		className: 'SoundCloudTrack',
		
		url: function () { return this.get('uri'); },
		
		fetch: function (options) {
			options = options ? Object.create(options) : {};
			var model = this;
			var success = options.success;
			options.success = function(resp) {
				if (!model.set(model.parse(resp, options), options)) {
					return false;
				}
				if (success) {
					success(model, resp, options);
				}
				model.trigger('sync', model, resp, options);
			};

			TrackLoader.getTrack(this.get('id'), options.success);

			return this;
		},

		parse: function (input) {
			function getTags(string) {
				var tags = [], tag;
				var regexp = /[^\s"']+|"([^"]*)"/g;
				while (tag = regexp.exec(string)) {
					tag = tag[1] || tag[0];
					if (tag.toUpperCase() !== 'MASHUP') {
						tags.push(tag);
					}
				}
				return tags;
			}

			input.tags = input.tag_list && getTags(input.tag_list) || input.tags || [];
			if (input.artwork_url) {
				input.artwork_url = input.artwork_url.replace('-large', '-t300x300');
			}

			return input;
		}
	});


	var trackCache = {};
	var factory = function (attributes, options) {
		if (!attributes || (!attributes.id && !attributes._id)) {
			throw new Error('SCTrack cannot be initialized without an id.');
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

			if (options.refetch) {
				track.fetch();
			}
		} else {
			track = trackCache[id] = new SCTrack(attributes, options);
			track.fetch();
		}

		return track;
	};

	return factory;
});