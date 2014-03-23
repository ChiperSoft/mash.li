var proxmis = require('proxmis');
var when = require('when');

var mongoose = require('app/db/mongo');

var sSetting = mongoose.Schema({
	_id: String,
	value: mongoose.Schema.Types.Mixed
});

var Setting = mongoose.model('Setting', sSetting);

Setting.get = function (name) {
	var p = proxmis();

	Setting.findOne({_id: name}, p);

	return when(p).then(function (model) {
		return model && model.value || false;
	});
};

Setting.set = function (name, value) {
	var p = proxmis();

	Setting.update({_id: name}, {_id: name, value: value}, {upsert:true}, p);

	return when(p);
};

module.exports = Setting;