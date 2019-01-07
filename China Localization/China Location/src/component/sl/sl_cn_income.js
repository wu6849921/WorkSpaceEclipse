/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NScriptName Income Suitelet
 * @NScriptId _sl_income
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/commons',
    '../../app/income/app_cn_income_handler',
    '../../constant/constant_cn_income'
],

function(commons, handler, constant) {
    /**
     * Dispatching requests to corresponding backend scripts.
     *
     * @param {Object} context The context of request and response.
     * @return undefined
     */
    function onRequest(context) {
        var request = context.request;
        var response = context.response;
        var filter = request.parameters.filter;
        var reportDataId = request.parameters.reportDataId;
        var format = request.parameters.format;
        log.debug({
            title: 'sl_cn_income.js: onRequest',
            details: 'request.parameters.filter:' + JSON.stringify(filter)
        });
        log.debug({
            title: 'sl_cn_income.js: onRequest',
            details: 'request.parameters.reportDataId:' + reportDataId
        });
        log.debug({
            title: 'sl_cn_income.js: onRequest',
            details: 'request.parameters.format:' + format
        });
        if (commons.makesure(filter)) {
            filter = JSON.parse(filter);
        }
        if (format === constant.FORMAT_PDF) {
            response.writeFile(handler.handleAsPDF(filter, reportDataId));
        } else if (format === constant.FORMAT_EXCEL) {
            response.writeFile(handler.handleAsExcel(filter, reportDataId));
        } else {
            response.writePage(handler.handleAsPage(filter, reportDataId));
        }
    }

    return {
        onRequest: onRequest
    };

});
