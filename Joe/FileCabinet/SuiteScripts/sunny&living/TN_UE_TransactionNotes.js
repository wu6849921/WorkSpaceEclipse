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
	 * @param {string}
	 *            scriptContext.type - Trigger type
	 * @param {Form}
	 *            scriptContext.form - Current form
	 * @Since 2015.2
	 */
	function beforeLoad(context) {
		try {
			context.form.getSublist('item').getField('rate').updateDisplayType(
					{
						displayType : 'disabled'
					});
		} catch (e) {
			log.debug({
				title : 'e',
				details : e
			});
		}

	}
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
				sublistId : 'item'
			});
			var user = runtime.getCurrentUser().name;
			for (var i = 0; i < lineCount; i++) {
				var item = newRecord.getSublistValue({
					sublistId : 'item',
					fieldId : 'item',
					line : i
				});
				var quantity = newRecord.getSublistValue({
					sublistId : 'item',
					fieldId : 'quantity',
					line : i
				});
				var rate = newRecord.getSublistValue({
					sublistId : 'item',
					fieldId : 'rate',
					line : i
				});
				var quantityInfo;
				var rateInfo;
				var typeInfo;
				var isNew = true;
				search
						.create(
								{
									type : 'customrecord_tn_systemnotes',
									filters : [
											[ 'custrecord_tn_transaction',
													'is', newRecord.id ],
											'AND',
											[ 'custrecord_tn_primarykey', 'is',
													item ] ],
									columns : [ 'custrecord_tn_field',
											'custrecord_tn_newvalue',
											'custrecord_tn_type' ]
								}).run().each(function(result) {
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
							if (field == 'quantity' && oldValue != quantity) {
								quantityInfo = oldValue;
							}
							if (field == 'rate' && oldValue != rate) {
								rateInfo = oldValue;
							}
							return true;
						});
				// 如果不存在则新增日志
				if (isNew || typeInfo == 'delete') {
					createNote(newRecord.id, record, item, user, 'create',
							'quantity', '', quantity);
					createNote(newRecord.id, record, item, user, 'create',
							'rate', '', rate);
					continue;
				}
				// 变化则生成日志记录
				if (quantityInfo) {
					createNote(newRecord.id, record, item, user, 'edit',
							'quantity', quantityInfo, quantity);
				}
				if (rateInfo) {
					createNote(newRecord.id, record, item, user, 'edit',
							'rate', rateInfo, rate);
				}

			}

			// 判断删除的情况
			var savedKeys = [];
			var deletedKeys = [];
			search.create(
					{
						type : 'customrecord_tn_systemnotes',
						filters : [ [ 'custrecord_tn_transaction', 'is',
								newRecord.id ] ],
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
					var item = newRecord.getSublistValue({
						sublistId : 'item',
						fieldId : 'item',
						line : j
					});
					if (item == savedKey) {
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
			fieldId : 'custrecord_tn_transaction',
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
		afterSubmit : afterSubmit,
		beforeLoad : beforeLoad
	};
});
