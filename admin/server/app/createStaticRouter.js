/**
 * Returns an Express Router with bindings for the Admin UI static resources,
 * i.e files, less and browserified scripts.
 *
 * Should be included before other middleware (e.g. session management,
 * logging, etc) for reduced overhead.
 */

var express = require('express');
var path = require('path');

module.exports = function createStaticRouter (keystone) {
	var router = express.Router();

	var keystoneTinymcePath = path.dirname(require.resolve('keystone-tinymce'));

	/* Configure router */
	router.use('/styles/fonts', express.static(`${keystoneTinymcePath}/skin/fonts`));
	router.use('/js/lib/tinymce/skins/keystone', express.static(`${keystoneTinymcePath}/skin`));
	router.use('/js/lib/tinymce/plugins/uploadimage', express.static(`${keystoneTinymcePath}/plugins/uploadimage`));
	router.use('/js/lib/tinymce', express.static(path.dirname(require.resolve('tinymce'))));
	router.use(express.static(path.resolve(__dirname + '/../../public')));

	return router;
};
