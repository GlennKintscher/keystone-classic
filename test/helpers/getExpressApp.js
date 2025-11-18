var keystone = require('../../index.js');
var mongoose = require('./getMongooseConnection.js');
var express = require('express');

function getExpressApp() {
	var app;

	keystone.init({
		'mongoose': mongoose
	});
	app = keystone.express();

	app.use(express.json());
	app.use(express.urlencoded({
		extended: true
	}));

	return app;
}

module.exports = getExpressApp;
