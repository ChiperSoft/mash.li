var color = require('cli-color');
var moment = require('moment');
var util = require('util');
var _ = require('lodash');

var cPrefix = color.blackBright;
var cEvent = color.blue.bold;
var cTarget = color.magenta;
var cSource = color.white;
var cID = function (input) {return input;};
var cStatus = color.green.underline;

function stringify (input) {
	if (typeof input === 'string' || typeof input === 'number') {
		return input;
	} else {
		return util.inspect(input, {
			depth: 5,
			colors: true
		});
	}
}

function debug(input) {
	if (input.level && input.level > debug.level) { return; }
	var time = moment().format('YYYY-MM-DD HH:mm:ss');

	var stack = [];
	var level = input.level && ("00000" + input.level).slice(-2) || '';
	stack.push(cPrefix(time + ' D'+level+':'));
	stack.push(cEvent(stringify(input.name)));

	if (input.status) {
		stack.push(cStatus(stringify(input.status)));
	}

	if (input.source) {
		stack.push(cSource(stringify(input.source)));
	}

	if (input.target) {
		stack.push(cTarget(stringify(input.target)));
	}

	if (input.id) {
		stack.push(cID(stringify(input.id)));
	}

	stack = stack.join(' ');

	if (input.noop) {
		return stack;
	} else {
		if (input.warn) {
			console.warn(stack);
		} else {
			console.log(stack);
		}
	}
}

debug.level = 10;

debug.fireAndForget = function (options) {
	return function (err) {
		if (!err) {return;}
		debug(_.assign({
			level: 1,
			warn: true
		}, options));
	};
};

module.exports = debug;