/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([ 'N/record', 'N/error', 'N/search' ], function(record, error, search) {
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
	function afterSubmit(context) {
		try {
			var newRecord = context.newRecord;
			var linkTran = newRecord.getValue({
				fieldId : 'custbody_linked_transaction'
			});
			if (linkTran) {
				return;
			}
			if (newRecord.type == 'itemfulfillment'
					|| newRecord.type == 'itemreceipt') {
				var createdfrom = newRecord.getText({
					fieldId : 'createdfrom'
				});
				if (createdfrom.indexOf("Transfer Order") == -1) {// 不是由公司间转账订单生成的，则不要此逻辑
					return;
				}
			}
			var subsidiary = newRecord.getValue({
				fieldId : 'subsidiary'
			});
			var trandate = newRecord.getValue({
				fieldId : 'trandate'
			});
			var recType = record.Type.JOURNAL_ENTRY;
			if (newRecord.type == 'itemreceipt') {
				recType = record.Type.ADV_INTER_COMPANY_JOURNAL_ENTRY;
			}
			var jeRec = record.create({
				type : recType,
				isDynamic : true
			});
			jeRec.setValue({
				fieldId : 'subsidiary',
				value : subsidiary
			});
			jeRec.setValue({
				fieldId : 'trandate',
				value : trandate
			});
			jeRec.setValue({
				fieldId : 'memo',
				value : '库存自动冲销凭证'
			});
			jeRec.setValue({
				fieldId : 'approvalstatus',
				value : '2'
			});
			var hasLine = false;
			search.create({
				type : 'transaction',
				filters : [ search.createFilter({
					name : 'internalid',
					operator : search.Operator.IS,
					values : newRecord.id
				}), search.createFilter({
					name : 'accountingbook',
					join : 'accountingtransaction',
					operator : search.Operator.IS,
					values : '1'
				}) ],
				columns : [ 'item', search.createColumn({
					name : 'account',
					join : 'accountingtransaction'
				}), search.createColumn({
					name : 'fxamount',
					join : 'accountingtransaction'
				}), search.createColumn({
					name : 'amount',
					join : 'accountingtransaction'
				}), 'name', 'department', 'class', 'location', 'subsidiary' ],
				settings : [ search.createSetting({
					name : 'consolidationtype',
					value : 'NONE'
				}) ]
			}).run().each(function(result) {
				var item = result.getValue({
					name : 'item'
				});
				var account = result.getValue(result.columns[1]);
				var amount = result.getValue(result.columns[3]);
				var entity = result.getValue({
					name : 'name'
				});
				var subsidiary = result.getValue({
					name : 'subsidiary'
				});
				// log.debug('subsidiary', subsidiary);
				var department = result.getValue({
					name : 'department'
				});
				var _class = result.getValue({
					name : 'class'
				});
				var location = result.getValue({
					name : 'location'
				});
				if (item) {// 如果为行数据
					var cashFlowItem = search.lookupFields({
						type : search.Type.ITEM,
						id : item,
						columns : 'custitem_tn_invglimpact'
					});
					if (!(cashFlowItem.custitem_tn_invglimpact)) {// 如果没有勾选则需要生成冲销凭证
						hasLine = true;

						jeRec.selectNewLine({
							sublistId : 'line'
						});
						if (newRecord.type == 'itemreceipt') {
							jeRec.setCurrentSublistValue({
								sublistId : 'line',
								fieldId : 'linesubsidiary',
								value : subsidiary
							});
						}
						jeRec.setCurrentSublistValue({
							sublistId : 'line',
							fieldId : 'account',
							value : account
						});
						jeRec.setCurrentSublistValue({
							sublistId : 'line',
							fieldId : 'debit',
							value : amount < 0 ? amount * -1 : 0
						});
						jeRec.setCurrentSublistValue({
							sublistId : 'line',
							fieldId : 'credit',
							value : amount > 0 ? amount : 0
						});
						jeRec.setCurrentSublistValue({
							sublistId : 'line',
							fieldId : 'memo',
							value : '库存自动冲销凭证'
						});
						jeRec.setCurrentSublistValue({
							sublistId : 'line',
							fieldId : 'entity',
							value : entity
						});
						if (department) {
							jeRec.setCurrentSublistValue({
								sublistId : 'line',
								fieldId : 'department',
								value : department
							});
						}
						if (_class) {
							jeRec.setCurrentSublistValue({
								sublistId : 'line',
								fieldId : 'class',
								value : _class
							});
						}
						if (location) {
							jeRec.setCurrentSublistValue({
								sublistId : 'line',
								fieldId : 'location',
								value : location
							});
						}
						jeRec.commitLine({
							sublistId : 'line'
						});
					}
				}
				return true;
			});
			if (hasLine) {
				var _id = jeRec.save();
				var id = record.submitFields({
					type : newRecord.type,
					id : newRecord.id,
					values : {
						custbody_linked_transaction : _id
					}
				});
				// log.debug('_id', _id);
			}

			// }
		} catch (e) {
			log.debug('e', e);
			var errorObj = error.create({
				name : e.name,
				message : e.message
			});
			throw errorObj;
		}

	}

	return {
		afterSubmit : afterSubmit
	};
});
