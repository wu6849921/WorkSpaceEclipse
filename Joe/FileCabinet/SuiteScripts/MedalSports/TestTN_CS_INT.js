/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @Nauthor Trigger Joe
 * @Nversion 1.0 20180319
 */
define([ 'N/record', 'N/search' ], function(record, search) {
	/**
	 * Validation function to be executed when field is changed.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.sublistId - Sublist name
	 * @param {string}
	 *            scriptContext.fieldId - Field name
	 * @param {number}
	 *            scriptContext.lineNum - Line number. Will be undefined if not
	 *            a sublist or matrix field
	 * @param {number}
	 *            scriptContext.columnNum - Line number. Will be undefined if
	 *            not a matrix field
	 * 
	 * @returns {boolean} Return true if field is valid
	 * 
	 * @since 2015.2
	 */
	function validateField(context) {
		var currentRecord = context.currentRecord;
		var sublistName = context.sublistId;
		var sublistFieldName = context.fieldId;
		// alert(1);
		if (sublistName === 'item' && sublistFieldName === 'amount') {
			var amount = currentRecord.getCurrentSublistValue({
				sublistId : 'item',
				fieldId : 'amount'
			});
			alert(amount);
			return true;
		}
		return true;
	}
	return {
		validateField : validateField
	};
});