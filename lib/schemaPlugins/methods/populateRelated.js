var _ = require('lodash');

module.exports = function populateRelated (rel) {

	var item = this;

	return this.getRelated(rel, true).then(function (results) {
		_.forEach(results, function (data, key) {
			item[key] = data;
		});
		return results;
	});

};
