/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope Public
 * @appliedtorecord
 */
define([ '../../lib/wrapper/ns_wrapper_ui_serverWidget',
		'../../lib/wrapper/ns_wrapper_runtime' ],

function(serverWidget, runtime) {
	var ITEMTYPES = [ 'otherchargeitem', 'noninventoryitem', 'serviceitem',
			'giftcertificateitem', 'kititem', 'inventoryitem',
			'serializedinventoryitem', 'lotnumberedinventoryitem' ];
	var TRANTYPES = [ 'vendorbill', 'vendorcredit',
			'vendorreturnauthorization', 'creditmemo', 'expensereport',
			'journalentry', 'advintercompanyjournalentry',
			'intercompanyjournalentry', 'check', 'salesorder', 'cashsale',
			'invoice', 'returnauthorization', 'cashrefund', 'purchaseorder',
			'customerdeposit', 'customerrefund', 'customerpayment' ];
	function beforeLoad(context) {
		if (runtime.executionContext === runtime.ContextType.USER_INTERFACE) {
			var transactionForm = context.form;
			var record = context.newRecord;
			if (record.type === 'subsidiary') {// to hide 'cfi is mandatory'
												// checkbox in subsidiary page
				var mandatoryField = transactionForm.getField({
					id : 'custrecord_cn_cfi_mandatory',
				});
				hideField(mandatoryField);
			} else if (record.type === 'account') {// to hide cash flow item in
													// account page
				var accountField = transactionForm.getField({
					id : 'custrecord_n112_cseg_cn_cfi'
				});
				hideField(accountField);
			} else if (ITEMTYPES.indexOf(record.type) !== -1) {// to hide cash
																// flow item in
																// item page
				var custItemField = transactionForm.getField({
					id : 'custitem_cseg_cn_cfi'
				});
				hideField(custItemField);
			} else if (TRANTYPES.indexOf(record.type) !== -1) {
				var bodyField = transactionForm.getField({
					id : 'custbody_cseg_cn_cfi'
				});
				// to hide cash flow item in specific transaction page
				// include body, expense, items, line
				hideField(bodyField);
				hideSublistCfi(transactionForm);
			}
		}
	}

	function hideField(field) {
		if (field) {
			field.updateDisplayType({
				displayType : serverWidget.FieldDisplayType.HIDDEN
			});
		}

	}

	function hideSublistCfi(transactionForm) {
		var sublistIdArr = [ 'expense', 'item', 'line' ];
		for (var i = 0; i < sublistIdArr.length; i++) {
			var tab = transactionForm.getSublist({
				id : sublistIdArr[i]
			});
			if (tab) {
				var field = tab.getField({
					id : 'custcol_cseg_cn_cfi'
				});
				hideField(field);
			}
		}
	}

	return {
		beforeLoad : beforeLoad
	};

});
