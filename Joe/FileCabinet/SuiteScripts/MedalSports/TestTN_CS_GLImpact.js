/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @Nauthor Trigger Joe
 * @Nversion 1.0 20180319
 */
define([ 'N/record', 'N/search' ], function(record, search) {
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
	function pageInit(scriptContext) {
		var currentRecord = scriptContext.currentRecord;
		var numLines = currentRecord.getLineCount({
			sublistId : 'item'
		});
		var siId = currentRecord.getValue({
			fieldId : 'custbody1',
		});

		for (var i = 0; i < numLines; i++) {
			var item = currentRecord.getSublistValue({
				sublistId : 'item',
				fieldId : 'item',
				line : i
			});
			if (item == siId)
				return;
		}
		// 如果不存在则新增
		currentRecord.selectNewLine({
			sublistId : 'item'
		});
		currentRecord.setCurrentSublistValue({
			sublistId : 'item',
			fieldId : 'item',
			value : siId
		});
		currentRecord.commitLine({
			sublistId : 'item'
		});

	}
	return {
		pageInit : pageInit
	};
});