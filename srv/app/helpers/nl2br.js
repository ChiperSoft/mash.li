
exports.nl2br = function (Handlebars) {
	return function (html) {

		html = html.replace(/\r\n|\r|\n/g, '<br>');

		return new Handlebars.SafeString(html);

	};
};
