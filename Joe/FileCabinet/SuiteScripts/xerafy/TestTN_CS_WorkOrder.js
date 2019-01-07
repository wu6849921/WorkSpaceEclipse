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
	function pageInit(scriptContext) {
		try {
			var currentRecord = scriptContext.currentRecord;
			var inventoryDetail = currentRecord.getSublistValue({
				sublistId : 'item',
				fieldId : 'inventorydetail',
				line : 1
			});
			var quantity = inventoryDetail.getValue({
				fieldId : 'quantity',
			});
			alert(Json.stringify(quantity));
		} catch (e) {
			alert(e);
			// TODO: handle exception
		}

		// alert(taxrate);}
	}

	return {
		pageInit : pageInit,
	};

});
