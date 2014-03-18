
// injects a value or a block of data into the current context. Designed for use in component blocks
// if key is wrapped in square braces ("[keyName]"), keyName is treated as an array and overwritten with a new array if not

module.exports = function () {
	return function (key, value, options) {
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
	};
};