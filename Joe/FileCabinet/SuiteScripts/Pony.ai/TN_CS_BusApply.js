/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @author Joe
 * @appliedtorecord pl so iv
 */
define([ 'N/record', 'N/search', 'N/currency' ], function(record, search,
		currency) {
	/**
	 * Function to be executed after sublist is inserted, removed, or edited.
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
	function sublistChanged(context) {
		var currentRecord = context.currentRecord;
		var sublistName = context.sublistId;
		var op = context.operation;
		if (sublistName === 'recmachcustrecord_tn_busapp') {
			var numLines = currentRecord.getLineCount({
				sublistId : 'recmachcustrecord_tn_busapp'
			});
			// alert(numLines);
			var totalAmt = 0;
			for (var i = 0; i < numLines; i++) {
				var lineAmount = currentRecord.getSublistValue({
					sublistId : sublistName,
					fieldId : 'custrecord_tn_busappdetail_amount',
					line : i
				});
				totalAmt += lineAmount;
			}
			currentRecord.setValue({
				fieldId : 'custrecord_tn_busapp_amount',
				value : totalAmt
			});
		}
	}
	/**
	 * Validation function to be executed when record is saved.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @returns {boolean} Return true if record is valid
	 * 
	 * @since 2015.2
	 */
	function saveRecord(context) {
		var currentRecord = context.currentRecord;
		var _num = currentRecord.getValue({
			fieldId : 'name'
		});
		// alert(_num);
		if (_num) {
			return true;
		}
		var prefix = 'TRP';// Ç°×º
		var serialNum = 1; // Á÷Ë®ºÅ
		search.create({
			type : 'customrecord_tn_busapply',
			columns : [ 'name', search.createColumn({
				name : 'internalid',
				sort : search.Sort.DESC
			}) ]
		}).run().each(
				function(result) {
					// alert(name);
					var curNum = result.getValue({
						name : 'name'
					});
					curNum = curNum.substring(curNum.length - 6).replace(
							/\b(0+)/gi, "");
					serialNum = parseInt(curNum) + 1;
				});
		var recNum = prefix + numFormat(serialNum + '', 6);
		// alert(recNum);
		currentRecord.setValue({
			fieldId : 'name',
			value : recNum
		});
		return true;
	}
	function numFormat(str, len) {
		var strLen = str.length;
		for (i = 0; i < len - strLen; i++) {
			str = "0" + str;
		}
		return str;
	}
	return {
		saveRecord : saveRecord,
		sublistChanged : sublistChanged
	};
});