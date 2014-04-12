
require('when/monitor/console');

var hourlyhot = require('app/hourlyhot');
var mongo = require('app/db/mongo');

hourlyhot().then(function () {
	mongo.disconnect();
});
