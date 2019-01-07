/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @author Joe
 * @appliedtorecord pl so iv
 */
define([ 'N/record', 'N/search', 'N/currency' ], function(record, search,
		currency) {
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
	 * 
	 * @since 2015.2
	 */
	function pageInit(context) {
		try {
			var currentRecord = context.currentRecord;
			// var accountType = currentRecord.getValue({
			// fieldId : 'accttype'
			// });
			var numLines = currentRecord.getLineCount({
				sublistId : 'apply'
			});
			// alert(numLines);
			for (var i = 0; i < numLines; i++) {
				var a = currentRecord.getSublistValue({
					sublistId : 'apply',
					fieldId : 'line',
					line : i
				});
				alert(a);
			}
		} catch (e) {
			alert(e);
		}

	}
	return {
		pageInit : pageInit
	};
});