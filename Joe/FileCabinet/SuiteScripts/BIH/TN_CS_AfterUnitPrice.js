/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @Nauthor Trigger Joe
 * @Nversion 1.0 20180305
 */
define([ 'N/record', 'N/search' ], function(record, search) {
	/**
	 * Function to be executed when field is changed.
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
	 * @since 2015.2
	 */
	function fieldChanged(context) {
		var currentRecord = context.currentRecord;
		var sublistName = context.sublistId;
		var sublistFieldName = context.fieldId;
		var numLines = currentRecord.getLineCount({
			sublistId : 'item'
		});

		// PO
		if (sublistName === 'item' && sublistFieldName === 'item') {
			var rate = currentRecord.getCurrentSublistValue({
				sublistId : 'item',
				fieldId : 'rate'
			});
			var taxrate = currentRecord.getCurrentSublistValue({
				sublistId : 'item',
				fieldId : 'taxrate1'
			});
			alert(rate + '___' + taxrate);
			if (rate && taxrate) {
				currentRecord.setCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol2',
					value : rate * (1 + taxrate)
				});

			}
		}
	}
	return {
		fieldChanged : fieldChanged,
	};
});