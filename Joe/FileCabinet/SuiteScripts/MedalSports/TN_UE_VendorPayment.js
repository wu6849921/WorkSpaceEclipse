/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Joe
 * @appliedtorecord OPP
 */
define([ 'N/search', 'N/record' ],

function(search, record) {

	/**
	 * Function definition to be triggered before record is loaded.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.newRecord - New record
	 * @param {Record}
	 *            scriptContext.oldRecord - Old record
	 * @param {string}
	 *            scriptContext.type - Trigger type
	 * @Since 2015.2
	 */
	function afterSubmit(context) {
		if (context.type == context.UserEventType.CREATE) {
			// 保存后回写剩下的钱到bill上
			var newRecord = context.newRecord;
			var numLines = newRecord.getLineCount({
				sublistId : 'apply'
			})
			for (var i = 0; i < numLines; i++) {
				var billId = newRecord.getSublistValue({
					sublistId : 'apply',
					fieldId : 'internalid',
					line : i
				});
				var amount = newRecord.getSublistValue({
					sublistId : 'apply',
					fieldId : 'amount',
					line : i
				});
				var due = newRecord.getSublistValue({
					sublistId : 'apply',
					fieldId : 'due',
					line : i
				});
				var dueAmt = due - amount;
				search.create(
						{
							type : search.Type.TRANSACTION,
							filters : [ [ 'internalid', 'anyof', billId ],
									'AND', [ 'mainline', 'is', 'true' ] ]
						}).run().each(function(result) {
					var billRecord = record.load({
						type : result.recordType,
						id : result.id
					});
					billRecord.setValue({
						fieldId : 'custbody_tn_amtrem',
						value : dueAmt
					});
					billRecord.save();
					return true;
				});

			}

		}
	}

	return {
		afterSubmit : afterSubmit
	};

});
