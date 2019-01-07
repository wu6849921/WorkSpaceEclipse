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

// entry point
function fieldChanged(type, name, linenum) {
	if (name == 'salesrep') {
		var salesrepId = nlapiGetFieldValue('salesrep');
		// alert(salesrepId);
		if (salesrepId) {
			var salesrepRecord = nlapiLoadRecord('employee', salesrepId);
			var mobilephoneV = salesrepRecord.getFieldValue('mobilephone');
			// alert(mobilephoneV);
			nlapiSetFieldValue('custbody_tn_salesrepphone', mobilephoneV);
		}
	}
}
function saveRecord() {
	var salesrepId = nlapiGetFieldValue('salesrep');
	// alert(salesrepId);
	if (salesrepId) {
		var salesrepRecord = nlapiLoadRecord('employee', salesrepId);
		var mobilephoneV = salesrepRecord.getFieldValue('mobilephone');
		// alert(mobilephoneV);
		nlapiSetFieldValue('custbody_tn_salesrepphone', mobilephoneV);
	}
	return true;
}
