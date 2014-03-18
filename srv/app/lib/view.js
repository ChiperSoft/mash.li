
var pathResolve = require('path').resolve,
	Handlebars = require('handlebars'),
	_ = require('lodash');

/** Handlebars Extensions *****************************************************************************************************************/

require('helper-hoard').load(Handlebars);

var root;
var templateCache = {};

function loadTemplate (src) {
	var actualpath;

	if (src.substr(0,3) === 'app') {
		actualpath = src + '.hbs';
	} else if (src.substr(0,7) === 'assets/') {
		actualpath = pathResolve(root + '/../public/' +src+'.hbs');
	} else {
		actualpath = pathResolve(root+src+'.hbs');
	}

	if (templateCache[actualpath]) {
		return templateCache[actualpath];
	} else {
		var template = require(actualpath)(Handlebars);

		return templateCache[actualpath] = template;
	}
}

// loads a template as a partial
Handlebars.registerHelper('require', function (path) {
	Handlebars.registerPartial(path, loadTemplate(path));
});


Handlebars.registerHelper('component', require('app/helpers/component')(Handlebars));
Handlebars.registerHelper('option', require('app/helpers/option')(Handlebars));

/** View Class *****************************************************************************************************************/

var View = function (name, options) {
	options = options || {};
	this.name = name;
	this.root = root = options.root;
	this.path = name;
};

View.prototype.render = function(options, fn){
	fn(false, loadTemplate(this.path)(options));
};

module.exports = View;
