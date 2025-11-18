module.exports = function createApp (keystone, express) {

	if (!keystone.app) {
		if (!express) {
			express = require('express');
		}
		keystone.app = express();
	}

	var app = keystone.app;

	keystone.initDatabaseConfig();
	keystone.initExpressSession(keystone.mongoose);

	require('./initTrustProxy')(keystone, app);
	require('./initViewEngine')(keystone, app);
	require('./initViewLocals')(keystone, app);

	// Compress response bodies
	if (keystone.get('compress')) {
		throw new Error('Not supported anymore. Please use a reverse proxy such as NGINX to handle compression.');
	}

	// Pre static config
	if (typeof keystone.get('pre:static') === 'function') {
		keystone.get('pre:static')(app);
	}
	app.use(function (req, res, next) {
		keystone.callHook('pre:static', req, res, next);
	});

	// Serve static assets

	// unless the headless option is set (which disables the Admin UI),
	// bind the Admin UI's Static Router for public resources
	if (!keystone.get('headless')) {
		app.use('/' + keystone.get('admin path'), require('../admin/server').createStaticRouter(keystone));
	}

	require('./bindSassMiddleware')(keystone, app);
	require('./bindStylusMiddleware')(keystone, app);
	require('./bindStaticMiddleware')(keystone, app);
	require('./bindSessionMiddleware')(keystone, app);

	// Log dynamic requests
	app.use(function (req, res, next) {
		keystone.callHook('pre:logger', req, res, next);
	});

	// Bind custom logging middleware
	if (keystone.get('logging middleware')) {
		app.use(keystone.get('logging middleware'));
	}

	// unless the headless option is set (which disables the Admin UI),
	// bind the Admin UI's Dynamic Router
	if (!keystone.get('headless')) {
		if (typeof keystone.get('pre:admin') === 'function') {
			keystone.get('pre:admin')(app);
		}
		app.use(function (req, res, next) {
			keystone.callHook('pre:admin', req, res, next);
		});
		app.use('/' + keystone.get('admin path'), require('../admin/server').createDynamicRouter(keystone));
	}

	// Pre bodyparser middleware
	if (typeof keystone.get('pre:bodyparser') === 'function') {
		keystone.get('pre:bodyparser')(app);
	}
	app.use(function (req, res, next) {
		keystone.callHook('pre:bodyparser', req, res, next);
	});

	require('./bindBodyParser')(keystone, app);

	// Add 'X-Frame-Options' to response header for ClickJacking protection
	if (keystone.get('frame guard')) {
		app.use(require('../lib/security/frameGuard')(keystone));
	}

	// Pre route config
	if (typeof keystone.get('pre:routes') === 'function') {
		keystone.get('pre:routes')(app);
	}
	app.use(function (req, res, next) {
		keystone.callHook('pre:routes', req, res, next);
	});

	// Configure application routes
	var appRouter = keystone.get('routes');
	if (typeof appRouter === 'function') {
		if (appRouter.length === 3) {
			// new:
			//    var myRouter = new express.Router();
			//    myRouter.get('/', (req, res) => res.send('hello world'));
			//    keystone.set('routes', myRouter);
			app.use(appRouter);
		} else {
			// old:
			//    var initRoutes = function (app) {
			//      app.get('/', (req, res) => res.send('hello world'));
			//    }
			//    keystone.set('routes', initRoutes);
			appRouter(app);
		}
	}


	require('./bindRedirectsHandler')(keystone, app);

	// Error config
	if (typeof keystone.get('pre:error') === 'function') {
		keystone.get('pre:error')(app);
	}
	app.use(function (error, req, res, next) {
		keystone.callHook('pre:error', error, req, res, next);
	});
	require('./bindErrorHandlers')(keystone, app);

	return app;

};
