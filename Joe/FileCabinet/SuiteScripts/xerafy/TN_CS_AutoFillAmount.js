/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope
 * @SameAccount
 * @FileName TN_CS_AutoFillAmount.js
 * @Description: ×Ô¶¯Ìî³ä
 * @Date 20180201
 * @Author Joe Wu
 */
define([ 'N/currentRecord' ],

function(currentRecord) {

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
	function fieldChanged(scriptContext) {
		try{
			var currentRecord = scriptContext.currentRecord;
			var sublistName = scriptContext.sublistId;
			var sublistFieldName = scriptContext.fieldId;
			var line = scriptContext.line;
			if (sublistName === 'item' && sublistFieldName === 'custcol1') {
				var custcol1 = currentRecord.getCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol1'
				});
				var taxRate = currentRecord.getCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'taxrate1'
				});
				var quantity = currentRecord.getCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'quantity'
				});
				// ÉèÖÃrate
				var rate = custcol1 / (1 + taxRate/100);
				rate=rate.toFixed(2);
//				alert('rate:'+rate);
				currentRecord.setCurrentSublistValue({
					sublistId: 'item',
					fieldId : 'rate',
					value : rate
				});
			}
		}catch (e) {
			alert(e);
			// TODO: handle exception
		}
		
		// alert(taxrate);}
	}

	return {
		fieldChanged : fieldChanged,
	};

});
