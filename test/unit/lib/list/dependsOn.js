var keystone = require('../../../../index.js');
var demand = require('must');

keystone.mongoose = require('../../../helpers/getMongooseConnection.js');

keystone.import('../models');

var DependsOn = keystone.list('DependsOn');

describe('Test dependsOn and required', function () {

	it('Ignore required if evalDependsOn is not `true` by setting `state` to `draft`', function (done) {
		// remove any Post documents
		DependsOn.model.find({}).deleteMany().exec()
			.then(function () {
				var newPost = new DependsOn.model({
					title: 'new post',
					state: 'draft'
				});

				newPost.save().then(function() { done(); });

			})
			.catch(function (error) {
				done(error);
			});
	});



	it('Save will fail if `state` set to `published` and `publishedDate` is not defined', function (done) {
		// remove any Post documents
		DependsOn.model.find({}).deleteMany().exec()
			.then(function () {
				// suppressing console log output
				const backupLog = console.error;
				console.error = () => null;

				var newPost = new DependsOn.model({
					title: 'new post',
					state: 'published',
					publishedDate: undefined,
				});

				newPost.save()
					.then(function () {
						console.error = backupLog;
						done(new Error('Save should have failed but succeeded'));
					})
					.catch(function (err) {
						demand(err).be.a.object();

						console.error = backupLog;
						done();
					});
			})
			.catch(function (error) {
				done(error);
			});

	});

	it('Save will succeed if `state` set to `published` and `publishedDate` is defined', function (done) {

		// remove any Post documents
		DependsOn.model.find({}).deleteMany().exec()
			.then(function () {
				var newPost = new DependsOn.model({
					title: 'new post',
					state: 'published',
					publishedDate: new Date()
				});
				newPost.save().then(function (item) { done(); }).catch(done);
			})
			.catch(function (error) {
				done(error);
			});
	});

	after(function (done) {
		// remove any remaining test data
		DependsOn.model.find({}).deleteMany().exec()
			.then(function () {
				done();
			})
			.catch(function (error) {
				done(error);
			});
	});
});
