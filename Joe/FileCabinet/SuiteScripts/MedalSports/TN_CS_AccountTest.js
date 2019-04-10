/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @author Joe
 * @appliedtorecord pl so iv
 */
define([ 'N/record', 'N/search' ], function(record, search) {
	/**
	 * Function to be executed after line is selected.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.sublistId - Sublist name
	 * 
	 * @since 2015.2
	 */
	function lineInit(context) {
		try {
			var currentRecord = context.currentRecord;
			var sublistName = context.sublistId;
			if (sublistName === 'item') {
				var item = currentRecord.getValue({
					fieldId : 'item'
				});
			}
			// alert(numLines);
			var a = currentRecord.getSublistValue({
				sublistId : 'apply',
				fieldId : 'line',
				line : i
			});
		} catch (e) {
			alert(e);
		}

	}
	return {
		lineInit : lineInit
	};
});