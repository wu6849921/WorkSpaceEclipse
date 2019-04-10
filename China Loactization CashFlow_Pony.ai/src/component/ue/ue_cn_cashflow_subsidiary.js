/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope Public
 * @appliedtorecord subsidiary
 */
define([ '../../lib/wrapper/ns_wrapper_ui_serverWidget', '../../lib/commons',
		'../../lib/wrapper/ns_wrapper_runtime' ],

function(serverWidget, commons, runtime) {

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
		log
				.debug('subsidiary record:', JSON
						.stringify(scriptContext.newRecord));
		var companyname = scriptContext.newRecord.getValue({
			fieldId : 'companyname'
		});
		if (commons.makesure(companyname) && runtime.isOW()) {
			scriptContext.form.getField({
				id : 'custrecord_cn_cfi_mandatory'
			}).updateDisplayType({
				displayType : serverWidget.FieldDisplayType.HIDDEN
			});
		}

	}

	return {
		beforeLoad : beforeLoad
	};

});
