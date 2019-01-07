/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([ 'N/record', 'N/search', 'N/error', 'N/format' ],

function(record, search, error, formatF) {
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
		if (context.type == context.UserEventType.CREATE
				|| context.type == context.UserEventType.EDIT) {
			var newRecord = context.newRecord;
			var numLines = newRecord.getLineCount({
				sublistId : 'item'
			});
			for (var i = 0; i < numLines; i++) {
				var A = newRecord.getSublistValue({
					sublistId : 'item',
					fieldId : 'a',
					line : i
				});
				var B = newRecord.getSublistValue({
					sublistId : 'item',
					fieldId : 'b',
					line : i
				});
				newRecord.setSublistValue({
					sublistId : 'item',
					fieldId : 'b',
					line : i,
					value : A + B
				});
			}
		}
	}
	return {
		afterSubmit : afterSubmit
	};

});
