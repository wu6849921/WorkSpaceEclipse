/**
 * Copyright 漏 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define([ '../../lib/wrapper/ns_wrapper_currentRecord', 'N/https',
		'../../lib/wrapper/ns_wrapper_dialog',
		'../../app/cashflow/app_cn_cashflow_cs_adapter', 'N/ui/message',

], function(currentRecord, https, dialog, cs_adapter, message) {
	var form;
	var originalPeriodFrom;
	var originalPeriodTo;
	var prePeriodFromForFiscalCheck;
	var prePeriodToForFiscalCheck;

	/**
	 * @desc pageInit
	 */
	function pageInit() {
		// alert('pageInit');
		form = currentRecord.get();
		originalPeriodFrom = form.getValue('custpage_periodfrom');
		originalPeriodTo = form.getValue('custpage_periodto');
		prePeriodFromForFiscalCheck = form.getValue('custpage_periodfrom');
		prePeriodToForFiscalCheck = form.getValue('custpage_periodto');
		cs_adapter.pageInit(form, dialog.alert);
	}

	/**
	 * @desc refresh cash flow filter form.
	 */
	function refreshCashFlowFilterForm() {
		form = currentRecord.get();
		setWindowChanged(window, false);
		if (cs_adapter.isPeriodRangeCrossFiscalYear(form, dialog.alert,
				prePeriodFromForFiscalCheck, prePeriodToForFiscalCheck)) {// 选择的期间是否跨年度
			return;
		}
		prePeriodFromForFiscalCheck = form.getValue('custpage_periodfrom');
		prePeriodToForFiscalCheck = form.getValue('custpage_periodto');
		cs_adapter.refreshCashFlowFilterForm(form, dialog.alert,
				https.get.promise, message);
	}
	/**
	 * @desc export file as pdf format.
	 */
	function exportCashFlowAsPDF() {
		form = currentRecord.get();
		cs_adapter.exportCashFlowAsPDF(form, dialog.alert, https.post);
	}

	function fieldChanged(context) {
		cs_adapter.fieldChanged(context.currentRecord, currentRecord.get(),
				context.fieldId, dialog.alert, originalPeriodFrom,
				originalPeriodTo);
		originalPeriodFrom = form.getValue('custpage_periodfrom');
		originalPeriodTo = form.getValue('custpage_periodto');
	}

	/**
	 * @desc export the file as excel format.
	 */
	function exportExcel() {
		form = currentRecord.get();
		cs_adapter.exportExcel(form);
	}

	return {
		pageInit : pageInit,
		refreshCashFlowFilterForm : refreshCashFlowFilterForm,
		exportCashFlowAsPDF : exportCashFlowAsPDF,
		fieldChanged : fieldChanged,
		exportExcel : exportExcel
	};
});
