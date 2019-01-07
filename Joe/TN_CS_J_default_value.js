/**
 * Module Description
 * 
 * Version Date Author Remarks Joe 10180108
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Void}
 */

function pageInit(type) {
//	nlapiLogExecution('debug','start');
	try {
		if (type == 'create') {
			//alert(nlapiGetFieldValue('salestaxcode'));
			nlapiSetFieldValue('salestaxcode',6);
		}
	} catch (ex) {
		nlapiLogExecution('debug', 'clientFieldChanged', ex);
		common.sendErrorEmail('mark.han@triggerasia.com', 'Riviera', 'TN_CS_Budget', 'clientFieldChanged', ex);
	}
}
