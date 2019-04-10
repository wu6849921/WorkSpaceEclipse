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
	function validateField(context) {
		try {
			var currentRecord = context.currentRecord;
			var sublistFieldName = context.fieldId;
			if (sublistFieldName == 'name') {
				var name = currentRecord.getValue({
					fieldId : sublistFieldName
				});
				if (!name) {
					return true;
				}
				var notExist = true;
				var currentRecordId = currentRecord.id?currentRecord.id:'-100';
				search
						.create(
								{
									type : 'customrecord_trigger_cn_coa',
									filters : [
											[ 'name', 'is', name ],
											'AND',
											[ 'internalid', 'noneof',
												currentRecordId ] ]
								}).run().each(function(result) {
							// alert(name);
							notExist = false;
							return true;
						});
				if (!notExist) {
					alert('CN COA name 重复！请重新输入！');
				}
				return notExist;
			}
			return true;
		} catch (e) {
			alert(e);
		}

	}
	return {
		validateField : validateField
	};
});