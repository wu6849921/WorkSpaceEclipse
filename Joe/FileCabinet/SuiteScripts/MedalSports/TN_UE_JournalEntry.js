/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([ 'N/record', 'N/error', 'N/search' ],

function(record, error, search) {
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
	 */
	function afterSubmit(context) {
		try {
			if (context.type == context.UserEventType.EDIT
					|| context.type == context.UserEventType.CREATE) {
				// if (context.type == context.UserEventType.CREATE) {
				// 保存折后设置baseCurrencyAmount为本位币
				var newRecord = context.newRecord;
				var _record = record.load({
					type : newRecord.type,
					id : newRecord.id
				});
				var i = 0;
				search.create({
					type : newRecord.type,
					filters : [ [ 'internalid', 'anyof', newRecord.id ] ],
					columns : [ 'debitamount', 'creditamount' ]
				}).run().each(function(result) {
					var debit = result.getValue({
						name : 'debitamount'
					});
					var credit = result.getValue({
						name : 'creditamount'
					});
					var amount = debit ? debit : credit;
					if (amount) {
						_record.setSublistValue({
							sublistId : 'line',
							fieldId : 'custcol_tn_usaamount',
							value : Math.abs(amount),
							line : i
						});
					}
					i++;
					return true;
				});
				_record.save();
				// var lineCount = newRecord.getLineCount({
				// sublistId : 'line'
				// });
				// var exchangeRate = newRecord.getValue({
				// fieldId : 'exchangerate'
				// });
				// for (var i = 0; i < lineCount; i++) {
				// var debit = newRecord.getSublistValue({
				// sublistId : 'line',
				// fieldId : 'debit',
				// line : i
				// });
				// var credit = newRecord.getSublistValue({
				// sublistId : 'line',
				// fieldId : 'credit',
				// line : i
				// });
				// var amount = debit == '' ? credit : debit;
				// var baseAmt = newRecord.getSublistValue({
				// sublistId : 'line',
				// fieldId : 'custcol_tn_usaamount',
				// line : i
				// });
				// if (!baseAmt) {
				// newRecord.setSublistValue({
				// sublistId : 'line',
				// fieldId : 'custcol_tn_usaamount',
				// value : amount * exchangeRate,
				// line : i
				// });
				// }
				// }

			}
		} catch (e) {
			log.debug({
				title : 'beforeSubmit',
				details : e
			});
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
