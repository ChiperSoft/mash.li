
var mongoose = require('app/db/mongo'),
	bcrypt = require('bcrypt'),
	SALT_WORK_FACTOR = 10;

var sUser = mongoose.Schema({
	email: String,
	password: String,
	isModerator: { type: Boolean, default: false }
});

sUser.pre('save', function (next) {
	var self = this;

	// only hash the password if it has been modified (or is new)
	if (!self.isModified('password')) {return next();}

	// generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
		if (err) {return next(err);}

		// hash the password using our new salt
		bcrypt.hash(self.password, salt, function (err, hash) {
			if (err) {return next(err);}

			// override the cleartext password with the hashed one
			self.password = hash;
			next();
		});
	});
});


var User = mongoose.model('User', sUser);

User.prototype.checkPassword = function (candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
		if (err) {return cb(err);}
		cb(null, isMatch);
	});
};

module.exports = User;
