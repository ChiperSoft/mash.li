
require('when/monitor/console');

var when = require('when');
var hourlyhot = require('app/hourlyhot');
var hourlybest = require('app/hourlybest');
var mongo = require('app/db/mongo');

when.all([
	hourlyhot(),
	hourlybest()
]).then(function () {
	mongo.disconnect();
});
