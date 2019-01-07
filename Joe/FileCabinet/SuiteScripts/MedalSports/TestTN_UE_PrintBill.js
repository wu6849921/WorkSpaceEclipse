/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([ 'N/record', 'N/url' ],

function(record, url) {
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
	function beforeLoad(context) {
		var newRecord = context.newRecord;
		if (context.type == context.UserEventType.VIEW
				&& newRecord.type == 'vendorbill') {
			var form = context.form;
			var billURL = url.resolveScript({
				scriptId : 'customscript_tn_sl_printbill',
				deploymentId : 'customdeploy_tn_sl_printbill',
				params : {
					recordId : newRecord.id
				}
			});
			form.addButton({
				id : 'custpage_tn_print',
				label : 'Print',
				functionName : '(function(){ window.open("' + billURL + '") })'
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
		var newRecord = context.newRecord;
		if (context.type == context.UserEventType.CREATE) {
			var entity;
			if (newRecord.type == record.Type.VENDOR_BILL) {
				// ����Vendor
				entity = newRecord.getValue({
					fieldId : 'custbody_tn_bill_vendor2',
				});
			} else {
				// ����Customer
				entity = newRecord.getValue({
					fieldId : 'custbody_tn_invoice_onhalfcustomer',
				});
			}
			var currency = newRecord.getValue({
				fieldId : 'currency',
			});
			var exchangeRate = newRecord.getValue({
				fieldId : 'exchangerate',
			});
			var tranDate = newRecord.getValue({
				fieldId : 'trandate',
			});
			var memo = newRecord.getValue({
				fieldId : 'memo',
			});
			var locationM = newRecord.getValue({
				fieldId : 'location',
			});

			var item = newRecord.getSublistValue({
				sublistId : 'item',
				fieldId : 'item',
				line : 0
			});
			var rate = newRecord.getSublistValue({
				sublistId : 'item',
				fieldId : 'rate',
				line : 0
			});
			var location = newRecord.getSublistValue({
				sublistId : 'item',
				fieldId : 'location',
				line : 0
			});

			if (entity) {
				var creRecord;
				if (newRecord.type == record.Type.VENDOR_BILL) {
					// ����vendor credit
					creRecord = record.create({
						type : record.Type.VENDOR_CREDIT,
						isDynamic : true
					});
					// ����date
					creRecord.setValue({
						fieldId : 'entity',
						value : entity
					});
				} else {
					// ����credit memo
					creRecord = record.create({
						type : record.Type.CREDIT_MEMO,
						isDynamic : true,
						defaultValues : {// ע�⣺Ҫ��defaultValues���ܴﵽ�ͽ��洴��һ����Ч����ֱ�Ӹ�ֵcustomerû��
							entity : entity
						}
					});
					// log.debug({
					// title : 'entity',
					// details : entity
					// });
				}
				// ����date
				creRecord.setValue({
					fieldId : 'trandate',
					value : tranDate
				});
				creRecord.setValue({
					fieldId : 'memo',
					value : memo
				});
				// ����currency
				creRecord.setValue({
					fieldId : 'currency',
					value : currency
				});
				// ����exchangerate
				creRecord.setValue({
					fieldId : 'exchangerate',
					value : exchangeRate
				});
				// ����exchangerate
				creRecord.setValue({
					fieldId : 'custbody_tn_createdbyscript',
					value : true
				});
				// ����location
				creRecord.setValue({
					fieldId : 'location',
					value : locationM
				});
				var line = creRecord.selectNewLine({
					sublistId : 'item'
				});
				// item
				line.setCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'item',
					value : item,
				});
				// rate
				line.setCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'rate',
					value : rate,
				});
				// rate
				line.setCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'location',
					value : location,
				});
				line.commitLine({
					sublistId : 'item'
				});
				var id = creRecord.save();
				log.debug({
					title : 'id',
					details : id
				});
			}

		}
	}

	return {
		beforeLoad : beforeLoad,
		// beforeSubmit : beforeSubmit
		afterSubmit : afterSubmit
	}

});
