
var proxmis = require('proxmis');
var mongoose = require('app/db/mongo');

var THRESHOLD_TRUSTED = 20;
var THRESHOLD_UNTRUSTED = -10;

var sVisitor = mongoose.Schema({
	_id: String,
	trust: { type: Number, default: 0 },
	voteCount: { type: Number, default: 0 },
	created_at: { type: Date, default: Date.now },
});

var Visitor = mongoose.model('Visitor', sVisitor);

Visitor.promiseByID = function (id) {
	var p = proxmis();
	Visitor.findById(id, p);
	return p;
};

Visitor.prototype.isTrusted = function () {
	if (this.trust > THRESHOLD_TRUSTED) {return true;}
	if (this.trust < THRESHOLD_UNTRUSTED) {return false;}
	return null;
};

module.exports = Visitor;
