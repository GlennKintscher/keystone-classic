module.exports = function sortable () {

	var list = this;

	this.add({
		sortOrder: { type: Number, index: true, hidden: true },
	});

	this.schema.pre('save', async function () {

		if (typeof this.sortOrder === 'number') {
			return;
		}

		var item = this;

		var addLast = async function () {
			var max = await list.model.findOne().sort('-sortOrder').exec();
			item.sortOrder = (max && max.sortOrder) ? max.sortOrder + 1 : 1;
		};

		if (list.get('sortable') === 'unshift') {
			try {
				await list.model.updateMany({}, { $inc: { sortOrder: 1 } }).exec();
				item.sortOrder = 1;
			}
			catch (err){
				console.log('err', err);
				await addLast();
			}
		} else {
			await addLast();
		}
	});

	this.schema.statics.reorderItems = function reorderItems (id, prevOrder, newOrder) {

		prevOrder = parseFloat(prevOrder);
		newOrder = parseFloat(newOrder);

		var whichWay = (newOrder > prevOrder) ? -1 : 1;
		var gte = (newOrder > prevOrder) ? prevOrder + 1 : newOrder;
		var lte = (newOrder > prevOrder) ? newOrder : prevOrder - 1;
		return list.model.updateMany(
			{ sortOrder: { $gte: gte, $lte: lte } },
			{ $inc: { sortOrder: whichWay } }
		).exec()
			.then(function () {
				return list.model.findOneAndUpdate({ _id: id }, { sortOrder: newOrder }).exec();
			})
			.catch(function (err) {
				console.log('err', err);
				// proceed to update the moved item regardless of the range update result
				return list.model.findOneAndUpdate({ _id: id }, { sortOrder: newOrder }).exec();
			});
	};

};
