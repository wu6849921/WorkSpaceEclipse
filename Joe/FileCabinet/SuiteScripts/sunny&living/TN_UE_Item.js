/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define([ 'N/record', 'N/search', 'N/runtime' ], function(record, search,
		runtime) {

	/**
	 * Function definition to be triggered before record is loaded.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.newRecord - New record
	 * @param {Record}
	 *            scriptContext.oldRecord - Old record
	 * @param {string}
	 *            scriptContext.type - Trigger type
	 * @Since 2015.2
	 * 
	 * joe add 20180315 update date batch and init 2 date
	 */
	function afterSubmit(context) {
		if (context.type == context.UserEventType.EDIT
				|| context.type == context.UserEventType.CREATE
				|| context.type == context.UserEventType.COPY) {
			var newRecord = context.newRecord;
			var lineCount = newRecord.getLineCount({
				sublistId : 'itemvendor'
			});
			var user = runtime.getCurrentUser().name;
			for (var i = 0; i < lineCount; i++) {
				var vendor = newRecord.getSublistText({
					sublistId : 'itemvendor',
					fieldId : 'vendor',
					line : i
				});
				// var purchaseprice = newRecord.getSublistText({
				// sublistId : 'itemvendor',
				// fieldId : 'purchaseprice',
				// line : i
				// });
				// var itemvendorprice = newRecord.getSublistValue({
				// sublistId : 'itemvendor',
				// fieldId : 'itemvendorprice',
				// line : i
				// });
				var purchaseprice = '';
				var ivpRecord = newRecord.getSublistSubrecord({
					sublistId : 'itemvendor',
					fieldId : 'itemvendorprice',
					line : i
				});
				var numLines1 = ivpRecord.getLineCount({
					sublistId : 'itemvendorpricelines'
				});
				for (var j = 0; j < numLines1; j++) {

					var vendorcurrency = ivpRecord.getSublistValue({
						sublistId : 'itemvendorpricelines',
						fieldId : 'vendorcurrency',
						line : j
					});
					var currencyRec = record.load({
						type : record.Type.CURRENCY,
						id : vendorcurrency
					});
					vendorcurrency = currencyRec.getValue({
						fieldId : 'name',
					});
					var vendorprice = ivpRecord.getSublistValue({
						sublistId : 'itemvendorpricelines',
						fieldId : 'vendorprice',
						line : j
					});
					// log.debug({
					// title : 'vendorcurrency',
					// details : vendor + '|' + vendorcurrency
					// });
					purchaseprice += vendorcurrency + ':' + vendorprice + ',';
				}
				if (purchaseprice != '') {
					purchaseprice = purchaseprice.substring(0,
							purchaseprice.length - 1);
				}
				// var vendorInfo;
				var priceInfo;
				var typeInfo;
				var isNew = true;
				search
						.create(
								{
									type : 'customrecord_tn_systemnotes',
									filters : [
											[ 'custrecord_tn_item', 'is',
													newRecord.id ],
											'AND',
											[ 'custrecord_tn_primarykey', 'is',
													vendor ] ],
									columns : [ 'custrecord_tn_field',
											'custrecord_tn_newvalue',
											'custrecord_tn_type' ]
								}).run().each(
								function(result) {
									isNew = false;
									// 如果存在判断数据是否变化
									var field = result.getValue({
										name : 'custrecord_tn_field'
									});
									var oldValue = result.getValue({
										name : 'custrecord_tn_newvalue'
									});
									var type = result.getValue({
										name : 'custrecord_tn_type'
									});
									typeInfo = type;
									// log.debug({
									// title : 'field|oldValue',
									// details : field + '|'
									// + oldValue
									// });
									if (field == 'purchaseprice'
											&& oldValue != purchaseprice) {
										priceInfo = oldValue;
									}
									return true;
								});
				// 如果不存在则新增日志
				if (isNew || typeInfo == 'delete') {
					createNote(newRecord.id, record, vendor, user, 'create',
							'vendor', '', vendor);
					createNote(newRecord.id, record, vendor, user, 'create',
							'purchaseprice', '', purchaseprice);
					continue;
				}
				// 变化则生成日志记录
				// if (vendorInfo) {
				// createNote(newRecord.id, record, vendor, user, 'edit',
				// 'vendor', vendorInfo, vendor);
				// }
				if (priceInfo) {
					createNote(newRecord.id, record, vendor, user, 'edit',
							'purchaseprice', priceInfo, purchaseprice);
				}

			}

			// 判断删除的情况
			var savedKeys = [];
			var deletedKeys = [];
			search.create({
				type : 'customrecord_tn_systemnotes',
				filters : [ [ 'custrecord_tn_item', 'is', newRecord.id ] ],
				columns : [ 'custrecord_tn_primarykey' ]
			}).run().each(function(result) {
				var primarykey = result.getValue({
					name : 'custrecord_tn_primarykey'
				});
				var type = result.getValue({
					name : 'custrecord_tn_type'
				});
				if (savedKeys.indexOf(primarykey) == -1) {
					savedKeys.push(primarykey);
				}
				if (deletedKeys.indexOf(primarykey) == -1 && type == 'delete') {
					deletedKeys.push(primarykey);
				}
				return true;
			});
			for (var i = 0; i < savedKeys.length; i++) {
				var savedKey = savedKeys[i];
				// 如果已经记录过删除则不需要再记录
				if (deletedKeys.length > 0
						&& deletedKeys.indexOf(savedKey) != -1) {
					continue;
				}
				var isDelete = true;
				for (var j = 0; j < lineCount; j++) {
					var vendor = newRecord.getSublistText({
						sublistId : 'itemvendor',
						fieldId : 'vendor',
						line : j
					});
					if (vendor == savedKey) {
						// log.debug({
						// title : 'isDelete',
						// details : isDelete
						// });
						isDelete = false;
						break;
					}
				}
				// 如果找不到就是被删除了，生成日志
				if (isDelete) {
					createNote(newRecord.id, record, savedKey, user, 'delete',
							'', '', '');
				}
			}
		}
	}
	function createNote(itemId, record, primarykey, user, type, field,
			oldValue, newValue) {
		var noteRecord = record.create({
			type : 'customrecord_tn_systemnotes'
		});
		noteRecord.setValue({
			fieldId : 'custrecord_tn_item',
			value : itemId
		});
		noteRecord.setValue({
			fieldId : 'custrecord_tn_primarykey',
			value : primarykey
		});
		noteRecord.setValue({
			fieldId : 'custrecord_tn_date',
			value : new Date()
		});
		noteRecord.setValue({
			fieldId : 'custrecord_tn_setby',
			value : user
		});
		noteRecord.setValue({
			fieldId : 'custrecord_tn_type',
			value : type
		});
		noteRecord.setValue({
			fieldId : 'custrecord_tn_field',
			value : field
		});
		noteRecord.setValue({
			fieldId : 'custrecord_tn_oldvalue',
			value : oldValue
		});
		noteRecord.setValue({
			fieldId : 'custrecord_tn_newvalue',
			value : newValue
		});
		noteRecord.save();
	}
	return {
		afterSubmit : afterSubmit
	};
});
