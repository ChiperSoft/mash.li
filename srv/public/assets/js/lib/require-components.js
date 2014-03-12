define(['jquery'], function ($) {
	$(function () {
		$('[data-component][data-hasview]').each(function (i, div) {
			var $div = $(div);

			require(['components/' + $div.attr('data-component') + '/main'], function (Component) {
				new Component({el: $div});
			});
		});
	});
});
