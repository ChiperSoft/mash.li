var pathResolve = require('path').resolve,
	Handlebars = require('handlebars'),
	_ = require('lodash');

_.each(require('mashli-helpers'), function (helper, name) {
	Handlebars.registerHelper(name, helper(Handlebars));
});

module.exports = function (root) {
	var cache = {};

	function getTemplate (src) {
		var actualpath;

		if (src.substr(0,3) === 'app') {
			actualpath = src + '.hbs';
		} else if (src.substr(0,7) === 'assets/') {
			actualpath = pathResolve(root + '/../../public/' + src + '.hbs');
		} else {
			actualpath = pathResolve(root + src + '.hbs');
		}

		if (cache[actualpath]) {
			return cache[actualpath];
		} else {
			var template = require(actualpath)(Handlebars);

			return cache[actualpath] = template;
		}
	}

	Handlebars.registerHelper('require', function (path) {
		Handlebars.registerPartial(path, getTemplate(path));
	});

	return function (req, res, next) {
		res.render = function (view, options) {
			res.send(getTemplate(view)(options));
		};
		next();
	};
};
