
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

// renders a component with the content of the component block.
// if first argument is a string it will assume component path and create a new instance of that component
// if function it will assume function is the rendering fuction
// otherwise assumes object already is initialized component

Handlebars.registerHelper('component', function (component, options) {
	switch (typeof component) {
	case 'string':
		component = new (require('app/components/'+component))(options.hash);
		break;
	case 'function':
		component = {render: component};
		break;
	case 'object':
		if (Array.isArray(component)) {throw new TypeError('Component cannot be an array');}
		if (typeof component.render !== 'function') {throw new TypeError('Component object does not have a render() function.');}
		break;
	default:
		throw new TypeError('Component path is an unrecognized type.');
	}

	var context = Object.create(this || {});
	var body = '';

	if (options.hash) {
		_.assign(context, options.hash);
	}

	if (options.fn) {
		body = options.fn(this);
	}

	context._body = body;

	var content = component.render(context);

	return new Handlebars.SafeString(content);
});

// injects a value or a block of data into the current context. Designed for use in component blocks
// if key is wrapped in square braces ("[keyName]"), keyName is treated as an array and overwritten with a new array if not
Handlebars.registerHelper('option', function (key, value, options) {
	options = arguments[arguments.length - 1];

	//make sure key is a string
	key = ''+key;

	if (arguments.length === 2) {
		value = undefined;
	}

	if (options.fn) {
		if (options.hash && options.hash.contextual) {
			value = {};
			options.fn(value);
		} else {
			value = options.fn(this);
		}
	}

	//test is the key is wrapped in braces, indicating an array append
	var arrayKey = key.match(/\[(\w+)\]/);
	if (arrayKey) {
		key = arrayKey[1];
		if (!Array.isArray(this[key])) {
			this[key] = [value];
		} else {
			this[key].push(value);
		}

	//not an array, treat as direct assignment
	} else {
		this[key] = value;
	}
});

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
