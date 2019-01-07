/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @Nauthor Trigger Joe
 * @Nversion 1.0 20180319
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
		if (sublistFieldName === 'custrecord_tn_l'
				|| sublistFieldName === 'custrecord_tn_w'
				|| sublistFieldName === 'custrecord_tn_h') {
			var lSize = currentRecord.getValue({
				fieldId : 'custrecord_tn_l'
			});
			var wSize = currentRecord.getValue({
				fieldId : 'custrecord_tn_w'
			});
			var hSize = currentRecord.getValue({
				fieldId : 'custrecord_tn_h'
			});
			if (lSize && wSize && hSize) {
				currentRecord.setValue({
					fieldId : 'custrecord_tn_cuft',
					value : lSize * wSize * hSize / 1728
				});
			}
		}
	}
	return {
		fieldChanged : fieldChanged
	};
});