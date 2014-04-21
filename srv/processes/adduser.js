
var prompt = require('prompt');

var User = require('app/models/User');

prompt.message = '';
prompt.delimiter = '';
prompt.start();

prompt.get({properties: {
	email: {
		pattern: /^[a-zA-Z\+\-@\.]+$/,
		description: "Email Address:",
		required: true
	},
	password: {
		description: "Password:",
		hidden: true,
		required: true
	},
	isModerator: {
		description: "Is this user a moderator?",
		pattern: /^[ynYN]$/,
		default: 'n'
	}
}}, function (err, inputs) {
	var user = new User(inputs);
	user.save(function (err) {
		if (err) {console.log(err);}
		process.exit();
	});
});
