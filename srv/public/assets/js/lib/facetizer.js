
define(['lodash', 'backbone', 'events'], function (_, Backbone, events) {

	var lastFacets;
	var targets = {
		start: /\/start\/(\d*)/,
		limit: /\/limit\/(\d*)/,
		list:  /\/list\/([^\/]*)/,
		play: /\/play\/?/,
		track: /\/track\/([^\/]*)/
	};

	var makers = {
		track: function (data) {return data.track && '/track/' + data.track || '';},
		start: function (data) {return data.start && '/start/' + data.start || '';},
		limit: function (data) {return data.limit && '/limit/' + data.limit || '';},
		list:  function (data) {return data.list  && '/list/'  + data.list || '';},
		play:  function (data) {return data.play  && '/play' || '';}
	};

	function parseFacets (url) {
		var keys = Object.keys(targets),
			i = keys.length,
			match, key,
			data = {play: false};

		while (--i >= 0) {
			key = keys[i];
			match = url.match(targets[key]);
			if (!match) {continue;}

			if (match.length === 1) {
				data[key] = true;
			} else if (match.length === 2) {
				data[key] = match[1];
			} else {
				data[key] = [].slice.call(match, 1);
			}

			if (match.index === 0) {
				data._first = key;
			}
		}

		return data;
	}

	function makeURL (combined) {
		var result = '',
			keys = Object.keys(combined),
			key,
			i = -1,
			c = keys.length;

		while (++i < c) {
			key = keys[i];
			if (!makers[key]) {continue;}

			result += makers[key](combined);
		}

		return result;
	}

	var router = new Backbone.Router({routes: {"*url": 'any'}});

	$(document).on('click', 'a[href]:not([data-bypass]):not([href^="http"])', function (evt) {

		var href = $(this).attr('href');
		var protocol = this.protocol + '//';
		var urlFacets;

		if (href.slice(protocol.length) === protocol) {
			return;
		}

		evt.preventDefault();

		urlFacets = parseFacets(href);
		urlFacets = _.extend({}, lastFacets, urlFacets);
		urlFacets = makeURL(urlFacets);

		router.navigate(urlFacets, true);

		if (window.ga) {
			ga('send', 'pageview', href);
		}

	});


	// router.on('route', console.log.bind(console));
	router.on('route:any', function (url) {
		var facets = parseFacets('/' + url);
		var changed = {};

		_.each(facets, function (value, key) {
			if (key.substr(0,1) === '_') {return;}
			if (lastFacets[key] !== value) {
				changed[key] = value;
				events.trigger('facet:' + key, value);
			}
		});
		_.each(lastFacets, function (value, key) {
			if (key.substr(0,1) === '_') {return;}
			if (typeof facets[key] === 'undefined') {
				changed[key] = null;
				events.trigger('facet:' + key);
			}
		});

		events.trigger({facetChange: changed, facets: facets});
		lastFacets = facets;
	});


	lastFacets = parseFacets(window.location.pathname);

	Backbone.history.start({root: '/', pushState: true});

	// return router;
});
