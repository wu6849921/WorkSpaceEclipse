/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope
 * @SameAccount
 * @FileName TN_CS_AutoFillAmount.js
 * @Description: 自动填充
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
	/**
	 * Validation function to be executed when sublist line is committed.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.sublistId - Sublist name
	 * 
	 * @returns {boolean} Return true if sublist line is valid
	 * 
	 * @since 2015.2
	 */
	function validateLine(scriptContext) {
		var currentRecord = scriptContext.currentRecord;
		var sublistName = scriptContext.sublistId;
		var bin = currentRecord.getCurrentSublistValue({
			sublistId : sublistName,
			fieldId : 'binnumber'
		});
		if (bin == '') {
			alert('请选择BIN位');
			return false;
		} else {
			return true;
		}

	}
	return {
		validateLine : validateLine
	};

});
