/*
TODO: Needs Review and Spec
*/

var getList = require('../list/get');

module.exports = function (req, res) {
	var keystone = req.keystone;
	if (!keystone.security.csrf.validate(req)) {
		console.log('Refusing to reorder ' + req.list.key + ' ' + req.params.id + '; CSRF failure');
		return res.apiError(403, 'invalid csrf');
	}
	req.list.model.reorderItems(req.params.id, req.params.sortOrder, req.params.newOrder)
		.then(function () {
			return getList(req, res);
		})
		.catch(function (err) {
			return res.apiError('database error', err);
		});
};
