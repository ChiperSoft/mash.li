var _ = require('lodash');

// renders a component with the content of the component block.
// if first argument is a string it will assume component path and create a new instance of that component
// if function it will assume function is the rendering fuction
// otherwise assumes object already is initialized component

exports.component = function (Handlebars) {
	return function (component, options) {
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
	};

};