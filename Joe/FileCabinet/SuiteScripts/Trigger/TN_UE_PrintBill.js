/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([ 'N/url' ],

function(url) {
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

	return {
		beforeLoad : beforeLoad
	};

});
