/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NScriptName Vat edit Suitelet
 * @NScriptId _sl_vat_edit
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/commons',
    '../../app/vat/app_cn_vat_edit_handler',
    '../../app/vat/app_cn_vat_data'
],

function(commons, handler, data) {
    /**
     * Dispatching requests to corresponding backend scripts.
     *
     * @param {Object} context The context of request and response.
     * @return undefined
     */
    function onRequest(context) {
        var request = context.request;
        var response = context.response;
        var params = {};
        params.format = request.parameters.format;
        if (commons.makesure(request.parameters.transTypes)) {
            params.transTypes = request.parameters.transTypes.split(',');
        }
        if (commons.makesure(request.parameters.orginalTransTypes)) {
            params.orginalTransTypes = request.parameters.orginalTransTypes.split(',');
        }
        params.subsidiaryId = request.parameters.subsidiaryId;
        params.invoiceType = request.parameters.invoiceType;
        params.customerOperator = request.parameters.customerOperator;
        if (commons.makesure(request.parameters.customerIds) && request.parameters.customerIds.length > 0)
            params.customerIds = request.parameters.customerIds.split(',');
        if (commons.makesure(request.parameters.orginalCustomerIds) && request.parameters.orginalCustomerIds.length > 0)
            params.orginalCustomerIds = request.parameters.orginalCustomerIds.split(',');
        params.startDate = request.parameters.startDate;
        params.endDate = request.parameters.endDate;
        params.minDocNo = request.parameters.minDocNo;
        params.maxDocNo = request.parameters.maxDocNo;
        params.cacheKey = request.parameters.cacheKey;
        params.refreshTime = request.parameters.refreshTime;
        params.dataLength = request.parameters.dataLength;
        params.salesList = request.parameters.salesList;
        params.preview = request.parameters.preview;
        params.ignoreWarning = request.parameters.ignoreWarning;
        if (context.request.method === 'POST') {
            handler.handleAsSaveRequest(JSON.parse(request.body));
            data.clearCachedData(params.cacheKey);
        } else {
            response.writePage(handler.handleAsPage(params));
        }
    }

    return {
        onRequest: onRequest
    };

});
