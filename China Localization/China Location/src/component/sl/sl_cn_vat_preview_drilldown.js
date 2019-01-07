/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NScriptName SL CN VAT Preview Drilldown
 * @NScriptId _sl_cn_vat_preview_drilldown
 * @NModuleScope TargetAccount
 */
define([
    '../../app/vat/drilldown/app_cn_vat_preview_drilldown_handler'
],

function(handler) {
    /**
     * Dispatching requests to corresponding backend scripts.
     *
     * @param {Object} context The context of request and response.
     * @return undefined
     */
    function onRequest(context) {
        var request = context.request;
        var response = context.response;
        var internalid = request.parameters.internalid;
        log.debug('sl_cn_vat_preview_drilldown.js, onRequest', 'internalid is ' + internalid);

        response.writePage(handler.handleAsPage(internalid));
    }

    return {
        onRequest: onRequest
    };

});
