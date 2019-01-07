/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([ 'N/runtime' ],
/**
 * @param {record}
 *            record
 */
function(runtime) {

	/**
	 * Function to be executed after page is initialized.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.mode - The mode in which the record is being
	 *            accessed (create, copy, or edit)
	 * 
	 * @since 2015.2
	 */
	function pageInit(scriptContext) {
		try {
			if (scriptContext.mode !== 'create') {
				return;
			}
			// if (type == 'create') {
			// var user = nlapiGetContext().user;
			var user = runtime.getCurrentUser();
			var currentRecord = scriptContext.currentRecord;
			if (user == '-4') {
				var webleadsource = getNS_url_param('webleadsource');
				// alert(webleadsource);
				if (webleadsource) {
					// nlapiSetFieldValue('custentity_tn_webleadsource',
					// webleadsource);
					currentRecord.setValue({
						fieldId : 'custentity_tn_webleadsource',
						value : webleadsource
					});
					// alert(nlapiGetFieldValue('custentity_tn_webleadsource'));
				}
				// }
			}
		} catch (ex) {
			// nlapiLogExecution('debug', 'pageInit', ex);
			alert(ex);
		}
	}

	function getNS_url_param(name) {
		try {
			name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
			var regexS = "[\\?&]" + name + "=([^&#]*)";
			var regex = new RegExp(regexS);
			var results = regex.exec(window.location.href);
			if (results == null)
				return "";
			else
				return results[1];
		} catch (ex) {
			alert(ex.getDetails());
		}
	}

	return {
		pageInit : pageInit
	};

});
