/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([ 'N/record', 'N/url' ],

function(record, url) {
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
		var newRecord = context.newRecord;
		if (context.type == context.UserEventType.CREATE
				|| context.type == context.UserEventType.EDIT) {
			var numLines = newRecord.getLineCount({
				sublistId : 'purchaseorders'
			});
			// log.debug({
			// title : 'numLines',
			// details : numLines
			// });
			for (var i = 0; i < numLines; i++) {
				var id = newRecord.getSublistValue({
					sublistId : 'purchaseorders',
					fieldId : 'id',
					line : i
				});
				// log.debug({
				// title : 'id',
				// details : id
				// });
				newRecord.setValue({
					fieldId : 'custbody_tn_bill_ponumber',
					value : id
				});
			}

		}
	}

	return {
		afterSubmit : afterSubmit
	}

});
