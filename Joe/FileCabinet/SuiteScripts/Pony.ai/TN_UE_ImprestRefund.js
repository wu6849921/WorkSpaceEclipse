/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([ 'N/record', 'N/url', 'N/redirect' ], function(record, url, redirect) {
	/**
	 * Function definition to be triggered before record is loaded.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.newRecord - New record
	 * @param {string}
	 *            scriptContext.type - Trigger type
	 * @param {Form}
	 *            scriptContext.form - Current form
	 * @Since 2015.2
	 */
	function afterSubmit(context) {
		try {
			var newRecord = context.newRecord;
			var oldRecord = context.oldRecord;
			// log.debug({
			// title : 'newRecord',
			// details : newRecord
			// });
			if (context.type == context.UserEventType.EDIT) {
				var appStatusOld = oldRecord.getValue({
					fieldId : 'custrecord_tn_ref_appstatus'
				});
				var appStatusNew = newRecord.getValue({
					fieldId : 'custrecord_tn_ref_appstatus'
				});
				var subsidiary = newRecord.getValue({
					fieldId : 'custrecord_tn_ref_subsidiary'
				});
				var appDate = newRecord.getValue({
					fieldId : 'custrecord_tn_ref_date'
				});
				var imprestAccount = newRecord.getValue({
					fieldId : 'custrecord_tn_ref_impaccount'
				});
				var bankAccount = newRecord.getValue({
					fieldId : 'custrecord_tn_ref_bankaccount'
				});
				var amount = newRecord.getValue({
					fieldId : 'custrecord_tn_ref_repamount'
				});
				var department = newRecord.getValue({
					fieldId : 'custrecord_tn_ref_department'
				});
				var memo = newRecord.getValue({
					fieldId : 'custrecord_tn_ref_memo'
				});
				var entity = newRecord.getValue({
					fieldId : 'custrecord_tn_ref_employee'
				});
				var cfi = newRecord.getValue({
					fieldId : 'custrecord_tn_imprefcashflowitem'
				});
				if (appStatusOld === '1' && appStatusNew === '2') {// 审批通过生成JE
					var jeRec = record.create({
						type : record.Type.JOURNAL_ENTRY,
						isDynamic : true
					});
					jeRec.setValue({
						fieldId : 'subsidiary',
						value : subsidiary
					});
					jeRec.setValue({
						fieldId : 'trandate',
						value : appDate
					});
					jeRec.setValue({
						fieldId : 'approvalstatus',
						value : '2'
					});
					jeRec.selectNewLine({
						sublistId : 'line'
					});
					jeRec.setCurrentSublistValue({
						sublistId : 'line',
						fieldId : 'account',
						value : imprestAccount
					});
					jeRec.setCurrentSublistValue({
						sublistId : 'line',
						fieldId : 'credit',
						value : amount
					});
					jeRec.setCurrentSublistValue({
						sublistId : 'line',
						fieldId : 'memo',
						value : memo
					});
					jeRec.setCurrentSublistValue({
						sublistId : 'line',
						fieldId : 'entity',
						value : entity
					});
					if (department) {
						jeRec.setCurrentSublistValue({
							sublistId : 'line',
							fieldId : 'department',
							value : department
						});
					}
					jeRec.commitLine({
						sublistId : 'line'
					});
					// bank line
					jeRec.selectNewLine({
						sublistId : 'line'
					});
					jeRec.setCurrentSublistValue({
						sublistId : 'line',
						fieldId : 'account',
						value : bankAccount
					});
					jeRec.setCurrentSublistValue({
						sublistId : 'line',
						fieldId : 'debit',
						value : amount
					});
					jeRec.setCurrentSublistValue({
						sublistId : 'line',
						fieldId : 'memo',
						value : memo
					});
					jeRec.setCurrentSublistValue({
						sublistId : 'line',
						fieldId : 'entity',
						value : entity
					});
					jeRec.setCurrentSublistValue({
						sublistId : 'line',
						fieldId : 'custcol_cseg_cn_cfi',
						value : cfi
					});
					if (department) {
						jeRec.setCurrentSublistValue({
							sublistId : 'line',
							fieldId : 'department',
							value : department
						});
					}
					jeRec.commitLine({
						sublistId : 'line'
					});
					var _id = jeRec.save();
					redirect.toSuitelet({
						scriptId : 'customscript_tn_triggerue',
						deploymentId : 'customdeploy_tn_triggerue',
						parameters : {
							'recordId' : _id,
							'recordType' : record.Type.JOURNAL_ENTRY
						}
					});
				}
			}
		} catch (e) {
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
