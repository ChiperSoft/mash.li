var color = require('cli-color');
var util = require('util');
var _ = require('lodash');
var basename = 'mashli';

if (!process.env.DEBUG) {process.env.DEBUG = basename + '*';}

var debug = require('debug');
var useColor = debug.useColors();
var noColor = function (input) {return input;};

var cPrefix = useColor && color.blackBright || noColor;
var cEvent  = useColor && color.blue.bold || noColor;
var cTarget = useColor && color.magenta || noColor;
var cID     = noColor;
var cStatus = useColor && color.green.underline || noColor;
var cError  = useColor && color.red || noColor;

function flattenObject(input) {
	var protos = [input];
	var parent = Object.getPrototypeOf(input);

	while (parent && parent !== Object.prototype) {
		protos.unshift(parent);
		parent = Object.getPrototypeOf(parent);
	}

	protos.unshift({});

	return _.assign.apply(null, protos);
}

function stringify (input) {
	if (typeof input === 'string' || typeof input === 'number') {
		return input;
	} else {
		if (typeof input === 'object') {
			input = flattenObject(input);
		}
		return util.inspect(input, {
			depth: 5,
			colors: true
		});
	}
}

var debugCache = {};
function getDebug (name) {
	if (!debugCache[name]) {
		var log = debug(basename + (name && ':' + name || ''));
		var error = debug(basename + (name && ':' + name || '') + ':error');
		error.log = console.error.bind(console);

		debugCache[name] = {
			log: log,
			error: error
		};
	}
	return debugCache[name];
}

module.exports = exports = function (input) {
	if (input.level && input.level > exports.level) { return; }

	var output = getDebug(input.source);

	var stack = [];
	var level = input.level && ("00000" + input.level).slice(-2) || '';

	stack.push(cEvent(stringify(input.name)));

	if (input.status) {
		stack.push(cStatus(stringify(input.status)));
	}

	if (input.target) {
		stack.push(cTarget(stringify(input.target)));
	}

	if (input.id) {
		stack.push(cID(stringify(input.id)));
	}

	if (input.error && input.error !== true) {
		var error = _.assign({ message: input.error.message, stack: (input.error.stack || '').split('\n').slice(1).map(function (v) { return '' + v + ''; }) }, input.error);
		stack.push(cError(stringify(error)));
	}

	if (input.raw) {
		stack.push(input.raw);
	}

	if (input.extra !== undefined) {
		if (Array.isArray(input.extra)) {
			stack.push.apply(stack, input.extra);
		} else {
			stack.push(input.extra);
		}
	}

	stack.push(cPrefix('L' + level));

	if (input.noop) {
		return stack;
	} else {
		if (input.error) {
			output.error.apply(null, stack);
		} else {
			output.log.apply(null, stack);
		}
	}
};

exports.level = 10;

exports.fireAndForget = function (options) {
	return function (err) {
		if (!err) {return;}

		exports(_.assign({
			level: 1,
			error: err
		}, options));
	};
};
