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
	 */
	function beforeSubmit(context) {
		if (context.type == context.UserEventType.EDIT
				|| context.type == context.UserEventType.CREATE
				|| context.type == context.UserEventType.COPY) {
			var newRecord = context.newRecord;
			var amount = newRecord.getSublistValue({
				sublistId : 'item',
				fieldId : 'amount',
				line : 0
			});
			newRecord.setSublistValue({
				sublistId : 'item',
				fieldId : 'amount',
				line : 0,
				value : Math.round(amount)
			});
		}
	}

	return {
		// beforeLoad : beforeLoad
		beforeSubmit : beforeSubmit
	// afterSubmit : afterSubmit
	}

});
