/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Jun 2016     Trigger_Mark
 *
 */

/**
 * @param {nlobjRequest}
 *            request Request object
 * @param {nlobjResponse}
 *            response Response object
 * @returns {Void} Any output is written via response object
 */
function lookUpEmployee(request, response) {
	if (request.getMethod() == 'GET') {
		var param = request.getParameter('custparam_param');
		var field = request.getParameter('custparam_field');
		var emtype = nlapiLookupField('employee', param, field);
		response.write(emtype);
	}
}