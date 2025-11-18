var uploads = require('../lib/uploads');
var express = require('express');

module.exports = function bindBodyParser (keystone, app) {
	// Set up body options and cookie parser
	var bodyParserParams = {};
	if (keystone.get('file limit')) {
		bodyParserParams.limit = keystone.get('file limit');
	}
	app.use(express.json(bodyParserParams));
	bodyParserParams.extended = true;
	app.use(express.urlencoded(bodyParserParams));
	if (keystone.get('handle uploads')) {
		uploads.configure(app, keystone.get('multer options'));
	}
};
