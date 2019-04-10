/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define([ 'N/search', 'N/record' ], function(search, record) {
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
	// function fieldChanged(context) {
	// var currentRecord = context.currentRecord;
	// var sublistId = context.sublistId;
	// var fieldId = context.fieldId;
	// var lineNum = context.lineNum;
	// if (sublistId === 'item') {
	// if (fieldId === 'rate') {
	// alert('请在item上设置该字段！否则改item不可用！');
	// // return false;
	// // isChange = true;
	// }
	// }
	// }
	/**
	 * Validation function to be executed when field is changed.
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
	 * @returns {boolean} Return true if field is valid
	 * 
	 * @since 2015.2
	 */
	function validateField(context) {
		var currentRecord = context.currentRecord;
		var sublistId = context.sublistId;
		var fieldId = context.fieldId;
		if (currentRecord.type == record.Type.INVENTORY_ITEM
				&& sublistId === 'itemvendor') {
			if (fieldId === 'vendor') {
				var vendorId = currentRecord.getCurrentSublistValue({
					sublistId : 'itemvendor',
					fieldId : 'vendor'
				});
				var appStatus = search.lookupFields({
					type : 'vendor',
					id : vendorId,
					columns : 'custentity_tn_app_status'
				});
				appStatus = appStatus.custentity_tn_app_status[0];
				if (!appStatus) {
					return true;
				}
				appStatus = appStatus.value;
				if (appStatus !== '2') {
					alert('该供应商未通过审批，无法使用！');
					return false;
				}
			}
		} else if (fieldId === 'entity') {
			var vendorId = currentRecord.getValue({
				fieldId : 'entity'
			});
			if (!vendorId) {
				return true;
			}
			var appStatus = search.lookupFields({
				type : 'vendor',
				id : vendorId,
				columns : 'custentity_tn_app_status'
			});
			appStatus = appStatus.custentity_tn_app_status[0];
			if (!appStatus) {
				return true;
			}
			appStatus = appStatus.value;
			if (appStatus !== '2') {
				alert('该供应商未通过审批，无法使用！');
				currentRecord.setValue({
					fieldId : 'entity',
					value : ''
				});
				return false;
			}
		}
		return true;
	}
	return {
		validateField : validateField
	};
});
