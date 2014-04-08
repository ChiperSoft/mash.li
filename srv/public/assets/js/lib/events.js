
define(['pinvault-observer', 'jquery'], function (pvo, $) {

	var events = pvo();

	// events.on([], function () { console.log.apply(console, arguments); });
	// events.on({}, function () { console.log.apply(console, arguments); });

	events.observerDelimiter = ':';

	function parseQuery (input) {
		var urlParams, match,
			split = input.split('?'),
			pl     = /\+/g,  // Regex for replacing addition symbol with a space
			search = /([^&=]+)=?([^&]*)/g,
			decode = function (s) {
				return decodeURIComponent(s.replace(pl, ' '));
			},
			query  = split[split.length - 1];

		urlParams = {};
		while (match = search.exec(query)) {
			urlParams[decode(match[1])] = decode(match[2]);
		}

		return urlParams;
	}


	$('body').on('click', 'a[href^="event:"]', function (ev) {
		ev.preventDefault();

		var anchor = ev.currentTarget;

		var path = anchor.getAttribute('href').split('/').slice(2);

		path.push(parseQuery(anchor.search));

		events.trigger.apply(events, path);
	});

	return events;


});
