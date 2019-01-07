/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       31 Jul 2015     Zed
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Access mode: create, copy, edit
 * @returns {Void}
 */
function pageInit(type) {
	try {
		if (type == 'create') {
			var user = nlapiGetContext().user;
			if (user == '-4') {
				var webleadsource = getNS_url_param('webleadsource');
				// alert(webleadsource);
				if (webleadsource) {
					nlapiSetFieldValue('custentity_tn_webleadsource',
							webleadsource);
					// alert(nlapiGetFieldValue('custentity_tn_webleadsource'));
				}
			}
		}
	} catch (ex) {
		nlapiLogExecution('debug', 'pageInit', ex);
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
