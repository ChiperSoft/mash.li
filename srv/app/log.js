var color = require('cli-color');
var moment = require('moment');

var cPrefix = color.blackBright;
var cEvent = color.blue.bold;
var cTarget = color.magenta;
var cSource = color.white;
var cID = function (input) {return input;};
var cStatus = color.green.underline;

function debug(input) {
	if (input.level && input.level > debug.level) { return; }
	var time = moment().format('YYYY-MM-DD HH:mm:ss');

	var stack = [];
	var level = input.level && ("00000" + input.level).slice(-2) || '';
	stack.push(cPrefix(time + ' D'+level+':'));
	stack.push(cEvent(input.name));

	if (input.status) {
		stack.push(cStatus(input.status));
	}

	if (input.source) {
		stack.push(cSource(input.source));
	}

	if (input.target) {
		stack.push(cTarget(input.target));
	}

	if (input.id) {
		stack.push(cID(input.id));
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

module.exports = debug;