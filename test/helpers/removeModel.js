var mongoose = require('mongoose');

module.exports = function removeModel(modelName) {
	try {
		mongoose.deleteModel(modelName);
	}
	catch (err) {
		// model didn't exist
	}
};
