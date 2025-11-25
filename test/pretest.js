var mongoose = require('mongoose');
const moment = require("moment/moment");
var mongoUri = 'mongodb://localhost/test';

function dropTestDatabase(done) {
	mongoose.connect(mongoUri)
		.then(function(){
			mongoose.connection.db.dropDatabase()
				.finally(function() {
					mongoose.connection.close()
						.then(function() {
							done();
						})
						.catch(function(err) {
							done(err);
						})
				});
		})
		.catch(function(err) {
			done(err);
		});
}

function pretestTasks() {
	dropTestDatabase(function () {});
}

pretestTasks();
