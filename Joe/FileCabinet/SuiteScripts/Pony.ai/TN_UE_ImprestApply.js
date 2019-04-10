/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(
		[ 'N/record', 'N/url', 'N/error', 'N/redirect' ],
		function(record, url, error, redirect) {
			function beforeLoad(context) {
				try {
					if (context.type !== context.UserEventType.VIEW)
						return;
					var newRecord = context.newRecord;
					var form = context.form;
					var type = newRecord.getValue({
						fieldId : 'custrecord_tn_type'
					});
					var employee = newRecord.getValue({
						fieldId : 'custrecord_tn_applicant'
					});
					var bankAccount = newRecord.getValue({
						fieldId : 'custrecord_tn_bankaccount'
					});
					var impAccount = newRecord.getValue({
						fieldId : 'custrecord_tn_imprestaccount'
					});
					var _url = url
							.format({
								domain : 'https://5059457-sb1.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=187',
								params : {
									type : type,
									employee : employee,
									bankAccount : bankAccount,
									impAccount : impAccount
								}
							});
					// log.debug({
					// title : '_url',
					// details : _url
					// });
					form.addButton({
						id : 'custpage_refimprest',
						label : '备用金还款',
						functionName : '(function(){ window.open("' + _url
								+ '") })'
					});
				} catch (e) {
					log.debug({
						title : 'e',
						details : e
					});
				}
			}
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
					if (context.type == context.UserEventType.EDIT) {
						var appStatusOld = oldRecord.getValue({
							fieldId : 'custrecord_tn_appstatus'
						});
						var appStatusNew = newRecord.getValue({
							fieldId : 'custrecord_tn_appstatus'
						});
						var subsidiary = newRecord.getValue({
							fieldId : 'custrecord_tn_subsidiary'
						});
						var appDate = newRecord.getValue({
							fieldId : 'custrecord_tn_applydate'
						});
						var imprestAccount = newRecord.getValue({
							fieldId : 'custrecord_tn_imprestaccount'
						});
						var bankAccount = newRecord.getValue({
							fieldId : 'custrecord_tn_bankaccount'
						});
						var amount = newRecord.getValue({
							fieldId : 'custrecord_tn_amount'
						});
						var department = newRecord.getValue({
							fieldId : 'custrecord_tn_department'
						});
						var memo = newRecord.getValue({
							fieldId : 'custrecord_tn_memo'
						});
						var entity = newRecord.getValue({
							fieldId : 'custrecord_tn_applicant'
						});
						var cfi = newRecord.getValue({
							fieldId : 'custrecord_tn_imp_cashflowitem'
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

							// bank account line
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
							// 保存之后为了触发JE后端脚本需要定位到suitelet触发
//							var _url = url.resolveScript({
//							    scriptId: 'customscript_tn_triggerue',
//							    deploymentId: 'customdeploy_tn_triggerue',
//							    params: {
//									'recordId' : _id,
//									'recordType' : record.Type.JOURNAL_ENTRY,
//									'rectype':'183'
//								}
//							});
//							var response = http.get({
//							    url: _url
//							});
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
				afterSubmit : afterSubmit,
				beforeLoad : beforeLoad
			};
		});
