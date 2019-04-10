/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @author Joe
 * @appliedtorecord pl so iv
 */
define([ 'N/search' ], function(search) {
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
			var sublistFieldName = context.fieldId;
			if (sublistFieldName == 'custbody_tn_er_busapp') {
				var busappId = currentRecord.getValue({
					fieldId : sublistFieldName
				});
				if (!busappId) {
					return;
				}
				var expenseReps = [];
				search.create(
						{
							type : 'expensereport',
							filters : [
									[ 'custbody_tn_er_busapp', 'anyof',
											busappId ], 'AND',
									[ 'mainline', 'is', 'T' ] ],
							columns : [ 'tranid' ]
						}).run().each(function(result) {
					var tranid = result.getValue({
						name : 'tranid'
					});
					expenseReps.push(tranid);
					return true;
				});
				if (expenseReps.length == 0) {
					return;
				}
				alert('该出差申请单已经被以下费用报销单关联：' + expenseReps);
				currentRecord.setValue({
					fieldId : 'custbody_tn_notfirst',
					value : true
				});
			}
		} catch (e) {
			alert(e);
		}

	}
	return {
		fieldChanged : fieldChanged
	};
});