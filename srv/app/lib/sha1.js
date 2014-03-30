
var crypto = require('crypto');

module.exports = function (input) {
	if (!input) {
		return '';
	}
	var shasum = crypto.createHash('sha1');
	shasum.update(input);
	return shasum.digest('hex');
};