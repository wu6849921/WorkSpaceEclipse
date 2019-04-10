/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NScriptName Cash Flow Suitelet
 * @NScriptId _sl_cn_cashflow
 * @NModuleScope TargetAccount
 */
define([ '../../lib/commons', '../../app/cashflow/app_cn_cashflow_handler' ],
		function(commons, handler) {

			/**
			 * Dispatching requests to corresponding backend scripts.
			 * 
			 * @param {Object}
			 *            context The context of request and response.
			 * @return undefined
			 */
			function onRequest(context) {

				var request = context.request;
				var response = context.response;
				var format = request.parameters.format;
				log.debug('sl_cn_cashflow.js: format:', format);

				var filter = request.parameters.filter;
				log.debug('sl_cn_cashflow.js: request.parameters.filter',
						filter);
				if (commons.makesure(filter)) {
					filter = JSON.parse(filter);
				}

				if (format === 'pdf') {
					response.write(handler.handleAsPDF(request.body));
				} else {
					response.writePage(handler.handleAsPage(filter));
				}
			}

			return {
				onRequest : onRequest
			};

		});
