/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([ 'N/record', 'N/search' ],

function(record, search) {
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
	 * 提交之后生成自定义apply record
	 */
	function beforeSubmit(context) {
		// log.debug({
		// title : 'afterSubmit'
		// });
		try {
			if (context.type == context.UserEventType.EDIT
					|| context.type == context.UserEventType.CREATE
					|| context.type == context.UserEventType.COPY) {
				var newRecord = context.newRecord;
				var lineCount = newRecord.getLineCount({
					sublistId : 'expense'
				});
				for (var i = 0; i < lineCount; i++) {
					var foreignAmount = newRecord.getSublistValue({
						sublistId : 'expense',
						fieldId : 'foreignamount',
						line : i
					});
					var currency = newRecord.getSublistValue({
						sublistId : 'expense',
						fieldId : 'currency',
						line : i
					});
					var exchangeRate = newRecord.getSublistValue({
						sublistId : 'expense',
						fieldId : 'exchangerate',
						line : i
					});
					newRecord.setSublistValue({
						sublistId : 'expense',
						fieldId : 'custcol_tn_foreignamtmd',
						line : i,
						value : foreignAmount
					});
					newRecord.setSublistValue({
						sublistId : 'expense',
						fieldId : 'custcol_tn_currencymd',
						line : i,
						value : currency
					});
					newRecord.setSublistValue({
						sublistId : 'expense',
						fieldId : 'custcol_tn_excratemd',
						line : i,
						value : exchangeRate
					});

				}
			}
		} catch (e) {
			log.debug({
				title : 'beforeSubmit',
				details : e
			});
		}
	}

	return {
		beforeSubmit : beforeSubmit
	};

});