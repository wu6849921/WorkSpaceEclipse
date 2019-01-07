/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define([], function() {

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
	function beforeSubmit(context) {
		if (context.type == context.UserEventType.EDIT
				|| context.type == context.UserEventType.CREATE
				|| context.type == context.UserEventType.COPY) {
			var newRecord = context.newRecord;
			var lineCount = newRecord.getLineCount({
				sublistId : 'item'
			});
			for (var i = 0; i < lineCount; i++) {
				newRecord.setSublistValue({
					sublistId : 'item',
					fieldId : 'custcol1',
					line : i,
					value : i + 1
				});
			}

		}

	}
	return {
		beforeSubmit : beforeSubmit
	}
});
