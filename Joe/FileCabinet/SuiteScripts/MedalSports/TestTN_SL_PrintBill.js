/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define([ 'N/render' ],
/**
 * @param {render}
 *            render
 */
function(render) {

	/**
	 * Definition of the Suitelet script trigger point.
	 * 
	 * @param {Object}
	 *            context
	 * @param {ServerRequest}
	 *            context.request - Encapsulation of the incoming request
	 * @param {ServerResponse}
	 *            context.response - Encapsulation of the Suitelet response
	 * @Since 2015.2
	 */
	function onRequest(context) {
		var request = context.request;
		var response = context.response;
		var transactionFile = render.transaction({
			entityId : 289,
			printMode : render.PrintMode.PDF,
			inCustLocale : true
		});
		// log.debug({
		// title : 'recordId',
		// details : request.parameters.recordId
		// });
		response.writeFile({
			file : transactionFile,
			isInline : true
		});
	}

	return {
		onRequest : onRequest
	};

});
