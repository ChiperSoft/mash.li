
define(['jquery', 'events', 'models/Track'], function ($, events, Track) {

	events.on('track:remove', function (ev, id) {
		var track = new Track({id: id});
		if (!confirm('Are you sure you want to remove "' + track.get('details').get('title') + '"?')) { return; }

		$.post('/mod/remove-track/' + id).done(function () {
			events.trigger('track:hide', id);
		});
	});

});
