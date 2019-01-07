/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NScriptName Subsidiary Ledger Suitelet
 * @NScriptId _sl_cn_sblg
 * @NModuleScope TargetAccount
 */
define([ '../../app/sblg/app_cn_sblg_handler', '../../lib/commons',
		'../../constant/constant_cn_sblg' ],

function(handler, commons, constant) {

	/**
	 * Dispatching requests to corresponding backend scripts.
	 * 
	 * @param {Object}
	 *            context The context of request and response.
	 * @return undefined
	 */
	function onRequest(context) {
		var response = context.response;
		var request = context.request;
		var filter = request.parameters.filter;
		var reportDataId = request.parameters.reportDataId;
		var format = request.parameters.format;
		if (commons.makesure(filter)) {
			filter = JSON.parse(filter);
		}

		if (format === constant.FORMAT_EXCEL) {
			response.writeFile(handler.handleAsExcel(filter, reportDataId));
		} else if (format === constant.FORMAT_PDF) {
			response.writeFile(handler.handleAsPDF({
				filter : filter,
				format : constant.FORMAT_PDF
			}, reportDataId));
		} else {
			response.writePage(handler.handleAsPage(filter, reportDataId));
		}
	}
	return {
		onRequest : onRequest
	};

});
