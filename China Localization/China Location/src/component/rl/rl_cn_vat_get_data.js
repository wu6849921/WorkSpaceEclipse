/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope Public
 */
define([
    '../../app/vat/app_cn_vat_edit_handler'
],

function(handler) {

    function doGet(requestParams) {
        return JSON.stringify(handler.handleAsData(JSON.parse(requestParams.params)));
    }

    return {
        'get': doGet
    };

});
