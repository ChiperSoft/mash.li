
var mongoose = require('app/db/mongo');

var sSetting = mongoose.Schema({
	_id: String,
	value: mongoose.Schema.Types.Mixed
});

var Setting = mongoose.model('Setting', sSetting);

module.exports = Setting;