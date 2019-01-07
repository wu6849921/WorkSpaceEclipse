/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NScriptName CN SL Voucher Print
 * @NScriptId _sl_cn_voucher_print
 * @NModuleScope TargetAccount
 */
define([
    '../../app/voucher/app_cn_voucher_handler',
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../lib/commons',
    '../../constant/constant_cn_voucher'
],

function(handler, runtime, commons, constants) {

    /**
     * Dispatching requests to corresponding backend scripts.
     *
     * @param {Object} context The context of request and response.
     * @return undefined
     */
    function onRequest(context) {
        //Check request start time
        var requestStartTime = runtime.clock();
        log.audit('start handling request...', requestStartTime);

        var request = context.request;
        var response = context.response;

        var format = request.parameters.format;
        log.debug('sl_cn_voucher_print.js: format', format);

        var filter = request.parameters.filter;
        log.debug('sl_cn_voucher_print.js: request.parameters.filter', filter);
  
        if (commons.makesure(filter)) {
            filter = JSON.parse(filter);
        }

        log.debug('sl_cn_voucher_print.js: filter', filter);

        if (format === constants.FORMAT_HTML) {
            response.writeLine(handler.handleAsHTML(filter));
        } else if (format === constants.FORMAT_PDF_ONLINE) {
            var pdfFile = handler.handleAsOnlinePDF(filter);
            if (commons.makesure(pdfFile)) {
                response.writeFile(pdfFile);
            } 
        } else if (format === constants.FORMAT_PDF_SCHEDULE) {
            handler.handleAsScheduledTask(filter);
        } else {
            response.writePage(handler.handleAsPage(filter));
        }

        //Check request end time
        var requestEndTime = runtime.clock();
        log.audit('Time spent (ms) on Request', requestEndTime - requestStartTime);
    }

    return {
        onRequest: onRequest
    };

});
