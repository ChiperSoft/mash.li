
require('when/monitor/console');

var picker = require('app/dailypicker');
var mongo = require('app/db/mongo');

picker(function () {
	mongo.disconnect();
});
