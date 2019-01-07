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
			if (sublistFieldName === 'custbody_tn_payment_apaccount'
					|| sublistFieldName === 'custbody_tn_payment_payee') {
				var arpaccount = currentRecord.getValue({
					fieldId : 'custbody_tn_payment_apaccount'
				});
				var payeeOrCustomer = currentRecord.getValue({
					fieldId : 'custbody_tn_payment_payee'
				});
				if (!arpaccount || !payeeOrCustomer) {
					return;
				}
				// 先删除原来的customrecord_tn_payment_apply
				var appSearch = search.create({
					type : 'customrecord_tn_payment_apply',
					filters : [ [ 'custrecord_tn_apply_payment', 'is',
							currentRecord.id ] ]
				});
				appSearch.run().each(function(result) {
					var applyId = record.delete({
					       type: 'customrecord_tn_payment_apply',
					       id: result.id
					    });
					alert(applyId);
				});
				// 查询符合条件的bill
				var vpSearch = search.create({
					type : search.Type.VENDOR_BILL,
					filters : [ [ 'account', 'is', arpaccount ], 'AND',
							[ 'entity', 'is', payeeOrCustomer ] ],
					columns : [ 'usertotal', 'duedate' ]
				});
				vpSearch.run().each(function(result) {
					var amount = result.getText({
						name : 'usertotal'
					});
					var date = result.getValue({
						name : 'duedate'
					});
					alert(amount +'&&'+ date);
					if (amount && date) {

						var applyRec = record.create({
							type : 'customrecord_tn_payment_apply',
							isDynamic : true
						});
						applyRec.setValue({
							fieldId : 'custrecord_tn_apply_payment',
							value : currentRecord.id
						});
						applyRec.setValue({
							fieldId : 'custrecord_tn_apply_datedue',
							value : date
						});
						applyRec.setValue({
							fieldId : 'custrecord_tn_apply_type',
							value : search.Type.VENDOR_BILL
						});
						applyRec.setValue({
							fieldId : 'custrecord_tn_origamt',
							value : amount
						});
						var applyId = applyRec.save();
						alert(id);
					}
					return true;
				});

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