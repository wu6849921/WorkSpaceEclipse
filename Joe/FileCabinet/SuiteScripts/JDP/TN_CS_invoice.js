/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @author Joe
 * @appliedtorecord payment billpayment
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
	 * 
	 * @since 2015.2
	 */
	function fieldChanged(context) {
		try {
			var currentRecord = context.currentRecord;
			var sublistName = context.sublistId;
			var sublistFieldName = context.fieldId;
			if (sublistFieldName === 'accttype') {
				var accttype = currentRecord.getValue({
					fieldId : 'accttype',
				});
				alert(accttype);
			}

		} catch (e) {
			if (e instanceof SuiteScriptError) {
				alert('name:' + e.getName() + ' message:' + e.getMessage());
			} else {
				alert(e);
			}
		}

	}

	return {
		fieldChanged : fieldChanged
	};
});