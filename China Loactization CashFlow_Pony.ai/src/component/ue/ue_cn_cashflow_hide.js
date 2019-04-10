/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope Public
 * @appliedtorecord JE
 */
define([ '../../lib/wrapper/ns_wrapper_ui_serverWidget',
		'../../lib/wrapper/ns_wrapper_runtime' ],

function(serverWidget, runtime) {

	function beforeLoad(context) {
		if (runtime.executionContext === runtime.ContextType.USER_INTERFACE) {
			var transactionForm = context.form;
			var tranType = transactionForm.getField({
				id : 'type'
			});
			var voidValue = transactionForm.getField({
				id : 'void'
			});

			if (tranType.defaultValue === 'journal'
					&& voidValue.defaultValue === "T") {
				var itemSublist = transactionForm.getSublist({
					id : 'line'
				});
				var cfsLineField = itemSublist.getField({
					id : 'custcol_cseg_cn_cfi'
				});
				cfsLineField.updateDisplayType({
					displayType : serverWidget.FieldDisplayType.HIDDEN
				});
			}
		}
	}

	return {
		beforeLoad : beforeLoad
	};

});
