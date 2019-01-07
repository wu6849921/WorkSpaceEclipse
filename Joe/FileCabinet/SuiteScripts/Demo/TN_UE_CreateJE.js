/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([ 'N/record', 'N/search', 'N/error', 'N/format' ],

function(record, search, error, formatF) {
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
		try {
			if (context.type == context.UserEventType.CREATE
					|| context.type == context.UserEventType.EDIT) {
				log.debug('afterSubmit:', 2);
				var newRecord = context.newRecord;
				var subsidiary = newRecord.getValue({
					fieldId : 'custrecord_tn_subsidiary'
				});
				var memo = newRecord.getValue({
					fieldId : 'custrecord_tn_memo'
				});
				var amount = newRecord.getValue({
					fieldId : 'custrecord13'
				});
				var jeRec = record.create({
					type : record.Type.JOURNAL_ENTRY,
					isDynamic : true
				});
				// …Ë÷√subsidiary
				jeRec.setValue({
					fieldId : 'subsidiary',
					value : subsidiary
				});
				jeRec.setValue({
					fieldId : 'currency',
					value : '1'
				});
				jeRec.setValue({
					fieldId : 'trandate',
					value : new Date()
				});
				jeRec.setValue({
					fieldId : 'memo',
					value : memo
				});
				jeRec.selectNewLine({
					sublistId : 'line'
				});
				jeRec.setCurrentSublistValue({
					sublistId : 'line',
					fieldId : 'account',
					value : '346'
				});
				jeRec.setCurrentSublistValue({
					sublistId : 'line',
					fieldId : 'credit',
					value : amount
				});
				jeRec.commitLine({
					sublistId : 'line'
				});
				jeRec.selectNewLine({
					sublistId : 'line'
				});
				jeRec.setCurrentSublistValue({
					sublistId : 'line',
					fieldId : 'account',
					value : '486'
				});
				jeRec.setCurrentSublistValue({
					sublistId : 'line',
					fieldId : 'debit',
					value : amount
				});
				jeRec.commitLine({
					sublistId : 'line'
				});
				jeRec.save({
					ignoreMandatoryFields : true
				});
			}
		} catch (e) {
			log.debug({
				title : 'afterSubmit',
				details : e
			});
			var errorObj = error.create({
				name : e.name,
				message : e.message
			});
			throw errorObj;
		}
	}
	return {
		afterSubmit : afterSubmit
	};

});
