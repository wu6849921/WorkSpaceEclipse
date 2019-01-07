/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/wrapper/ns_wrapper_config',
    '../../lib/wrapper/ns_wrapper_search',
    '../../lib/wrapper/ns_wrapper_runtime'
],

function(config, search, runtime) {

    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
        var request = context.request;
        var response = context.response;
        var subsidiaryId = request.parameters.subsidiaryId;

        if (!runtime.isOW()) {
            var companyInfo = config.load({
                type: config.Type.COMPANY_INFORMATION
            });
            response.write(JSON.stringify(companyInfo.getValue('custrecord_cn_cfi_mandatory')));
        } else {
            var subsidiaryLookup = search.lookupFields({
                type: search.Type.SUBSIDIARY,
                id: subsidiaryId,
                columns: [
                    'custrecord_cn_cfi_mandatory'
                ]
            });
            var isMandatory = subsidiaryLookup && subsidiaryLookup.custrecord_cn_cfi_mandatory;
            response.write(JSON.stringify(isMandatory));
        }

    }

    return {
        onRequest: onRequest
    };

});
