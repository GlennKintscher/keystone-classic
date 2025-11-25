var keystone = require('../../');

var historyModelSuffix = '_revisions';

function getHistoryModelName (list) {
	return list.options.schema.collection + historyModelSuffix;
}

function getHistoryModel (list, userModel) {

	var collection = getHistoryModelName(list);

	var schema = new keystone.mongoose.Schema({
		i: { type: keystone.mongoose.Schema.Types.ObjectId, ref: collection },
		t: { type: Date, index: true, required: true },
		o: { type: String, index: true, required: true },
		c: { type: [String], index: true },
		d: { type: keystone.mongoose.Schema.Types.Mixed, required: true },
	}, {
		id: true,
		versionKey: false,
	});

	if (userModel) {
		schema.add({
			u: { type: keystone.mongoose.Schema.Types.ObjectId, ref: userModel },
		});
	}

	return keystone.mongoose.model(collection, schema, collection);

}

/**
 * List history option
 *
 * When enabled, it tracks changes to each document on save or remove.
 */

module.exports = function history () {

	var list = this;

	// If model already exists for a '_revisions' in an inherited model, log a warning but skip creating the new model (inherited _revisions model will be used).
	var collectionName = getHistoryModelName(list);
	if (list.get('inherits')
		&& collectionName.indexOf(historyModelSuffix, collectionName.length - historyModelSuffix.length) !== -1
		&& keystone.mongoose.models[collectionName]) {
		console.log('List/model already exists for ' + collectionName + '.\nWon\'t re-create, keystone continuing.');
		return;
	}

	var userModel = keystone.get('user model');

	var HistoryModel = list.HistoryModel = getHistoryModel(this, userModel);

	list.schema.add({
		__rev: Number,
	});

	list.schema.pre('save', function () {
		this.__rev = (typeof this.__rev === 'number') ? this.__rev + 1 : 1;

		var data = this.toObject();
		delete data._id;
		delete data.__v;
		delete data.__rev;

		var doc = {
			i: this.id,
			t: Date.now(),
			o: this.isNew ? 'c' : 'u',
			c: [],
			d: data,
		};

		for (var path in list.fields) {
			if (this.isModified(path)) {
				doc.c.push(path);
			}
		}

		if (list.autokey) {
			if (this.isModified(list.autokey.path)) {
				doc.c.push(list.autokey.path);
			}
		}

		if (userModel && this._req_user) {
			doc.u = this._req_user;
		}

		return new HistoryModel(doc).save();
	});

	async function remove (data, user) {
		data.__v = undefined;

		var doc = {
			t: Date.now(),
			o: 'd',
			d: data,
		};

		if (userModel && user) {
			doc.u = user;
		}

		await new HistoryModel(doc).save();
	}

	list.schema.pre('deleteOne', { document: true, query: false }, async function () {
		var data = this.toObject();
		await remove(data, this._req_user);
	});

	list.schema.pre('deleteMany', async function () {
		var query = this;

		var results = await list.model.find(query.getFilter()).exec();
		for (const result of results) {
			var data = result.toObject();
			await remove(data, query._req_user);
		}
	});

};
