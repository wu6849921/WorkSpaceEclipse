/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope Public
 */
define([ '../../lib/wrapper/ns_wrapper_task',
		'../../app/cashflow/app_cn_cashflow_pymt_ap_parser',
		'../../app/cashflow/app_cn_cashflow_pymt_ap_cacher',
		'../../dao/cn_cashflow_collector_dao',
		'../../lib/wrapper/ns_wrapper_record',
		'../../app/cashflow/app_cn_cashflow_ap_collector', '../../lib/commons',
		'../../lib/letssubmittask', '../../app/helper/cashflow_helper',
		'../../lib/wrapper/ns_wrapper_file',
		'../../lib/wrapper/ns_wrapper_runtime' ],

function(task, pymtParser, pymtCacher, collectorDao, record, apCollector,
		commons, letssubmittask, helper, file, runtime) {
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
	function afterSubmit(scriptContext) {
		var triggerType = scriptContext.type;
		log.debug('ue_cn_cashflow', 'scriptContext.type=' + triggerType);

		if (triggerType === 'create' || triggerType === 'edit'
				|| triggerType === 'delete' || triggerType === 'paybills'
				|| scriptContext.type === 'copy') {
			var currentRec = scriptContext.newRecord;
			log.debug('ue_cn_cashflow', 'type=' + currentRec.type + ',id='
					+ currentRec.id);

			if (currentRec.id === 0) {
				return;
			}
			var skipTypeArr = [ record.Type.INVOICE, record.Type.VENDOR_BILL,
					record.Type.SALES_ORDER, record.Type.CREDIT_MEMO,
					record.Type.VENDOR_CREDIT, record.Type.EXPENSE_REPORT,
					record.Type.PURCHASE_ORDER
			// 'customercharge'
			];
			if (skipTypeArr.indexOf(currentRec.type) > -1) {
				return;
			}

			// we have to get credits thru dynamic record due to the system
			// limitation.
			if (currentRec.type === record.Type.VENDOR_PAYMENT) {
				var pymtAppliedInfo = pymtParser.fetchPymtApplyInfo(currentRec,
						triggerType);
			} else if (currentRec.type === record.Type.CUSTOMER_PAYMENT) {
				pymtAppliedInfo = helper.getAppliedTransactions({
					applyingRecord : currentRec,
					sublistId : 'credit'
				});
			}
			log.debug('ue_cn_cashflow', 'type=' + currentRec.type + ',id='
					+ currentRec.id);
			var cashflow_params = {
				type : triggerType,
				trantype : currentRec.type,
				tranid : currentRec.id,
				apply : pymtAppliedInfo
			}

			var objstr = JSON.stringify(cashflow_params);
			var hasExceedMaxLimit = pymtCacher.hasExceedMaxLimit(objstr);
			if (hasExceedMaxLimit
					&& currentRec.type === record.Type.VENDOR_PAYMENT) {
				log.debug('pymtAppliedInfo', JSON.stringify(pymtAppliedInfo));
				cashflow_params.usecache = true;
				var recordid = pymtCacher.cacheParamsToRecord(pymtAppliedInfo);
				log.debug('recordid', recordid);
				cashflow_params.apply = recordid;
			}

			letssubmittask.submitTask(task.create({
				taskType : task.Type.SCHEDULED_SCRIPT,
				scriptId : 'customscript_ss_cn_cashflow_collect',
				deploymentId : 'customdeploy_ss_cn_cashflow_collect',
				params : {
					custscript_cashflow_params : cashflow_params
				}
			}));
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
	function beforeLoad(scriptContext) {
		if (runtime.executionContext === runtime.ContextType.USER_INTERFACE) {
			if (scriptContext.type === 'create'
					|| scriptContext.type === 'edit'
					|| scriptContext.type === 'copy') {
				var currentRec = scriptContext.newRecord;
				log.debug('beforeLoad.currentRec type' + currentRec.type);
				if (currentRec.type === record.Type.VENDOR_PAYMENT
						|| currentRec.type === record.Type.DEPOSIT
						|| currentRec.type === record.Type.CUSTOMER_PAYMENT) {
					return;
				}
				var fileObj = file.load({
					path : 'src/component/ue/cn_filter_cfs.js'
				});
				log.debug('ue_cn_cashflow.beforeLoad', fileObj.url);
				var initField = scriptContext.form.addField({
					id : 'custpage_initfield',
					label : 'initfield',
					type : 'INLINEHTML'// serverWidget.FieldType.INLINEHTML
				});
				initField.defaultValue = "<script type='text/javascript' src='"
						+ fileObj.url + "'></script>";
			}
		}
	}

	return {
		afterSubmit : afterSubmit,
		beforeLoad : beforeLoad
	};

});
