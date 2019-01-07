/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define([], function() {

	/**
	 * Function to be executed after page is initialized.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.mode - The mode in which the record is being
	 *            accessed (create, copy, or edit)
	 * 
	 * @since 2015.2
	 */
	function pageInit(context) {
		try {
			var currentRecord = context.currentRecord;
			var numLines = currentRecord.getLineCount({
				sublistId : 'item'
			});
			var totalCarton;
			var totalQuantity;
			for (var i = 0; i < numLines; i++) {
				var cartonQty = currentRecord.getSublistField({
					sublistId : 'item',
					fieldId : 'custcol_tn_carton_qty',
					line : i
				});
				var quantity = currentRecord.getSublistField({
					sublistId : 'item',
					fieldId : 'quantity',
					line : i
				});
				totalCarton += cartonQty;
				totalQuantity += quantity;
			}

		} catch (ex) {
			alert(ex);
		}
	}
	return {
		pageInit : pageInit
	// fieldChanged : fieldChanged
	// pageInit : pageInit
	// validateField : validateField
	// validateInsert : validateInsert
	// postSourcing : postSourcing
	// validateLine : validateLine
	// saveRecord : saveRecord
	};
});
