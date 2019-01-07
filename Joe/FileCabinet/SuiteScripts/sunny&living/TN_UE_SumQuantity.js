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
			var totalCarton = 0;
			var totalQuantity = 0;
			for (var i = 0; i < lineCount; i++) {
				var cartonQty = newRecord.getSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_carton_qty',
					line : i
				});
				var quantity = newRecord.getSublistValue({
					sublistId : 'item',
					fieldId : 'quantity',
					line : i
				});
				if (cartonQty) {
					totalCarton += parseInt(cartonQty);
				}
				if (quantity) {
					totalQuantity += parseInt(quantity);
				}
			}
			if (totalCarton) {
				newRecord.setValue({
					fieldId : 'custbody_tn_tran_totalcarton',
					value : totalCarton
				});
			}
			if (totalQuantity) {
				newRecord.setValue({
					fieldId : 'custbody_tn_tran_totalquantity',
					value : totalQuantity
				});
			}
		}

	}
	return {
		beforeSubmit : beforeSubmit
	};
});
