
function padleft (value) {
	value = '' + value;
	return new Array(2 - value.length + 1).join('0') + value;
}

exports.durationShort = function () {
	return function (units) {

		var //keys  = ['hr',    'min',    'sec'],
			divs  = [3600000,   60000,  1000],
			stack = [],
			level = 0,
			value;

		units = Math.abs(units);

		while (units && level < divs.length) {
			value = Math.floor(units / divs[level]);
			units = units % divs[level];

			if (level === divs.length - 1 && units > divs[level] / 2) {
				units++;
			}

			if (value || stack.length) {
				stack.push( padleft(value) );
			}

			level++;
		}

		return stack.join(':');

	};
};
