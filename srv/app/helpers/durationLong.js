
exports.durationLong = function () {
	return function (units) {

		var keys  = ['hr',    'min',    'sec'],
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

			if (value) {
				stack.push( value + ' ' + keys[level] + (value > 1 ? 's' : ''));
			}
			level++;
		}

		return stack.join(' ');

	};
};