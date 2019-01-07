/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
* @NApiVersion 2.x
* @NScriptType Suitelet
* @NModuleScope TargetAccount
*/
define([
    '../../lib/wrapper/ns_wrapper_file',
    '../../lib/wrapper/ns_wrapper_ui_serverWidget',
    '../../app/vat/app_cn_vat_invoice_file_parser',
    '../../app/vat/app_cn_vat_import_form'
],

function(file, serverWidget, fileParser, importForm) {

    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {

        var fileContent;
        if (context.request.method === 'GET') {
            var form = importForm.createForm();
            context.response.writePage({
                pageObject: form
            });
        } else {
            var request = context.request;
            var fileObj = request.files['custpage_file_browser'];

            fileContent = fileObj.getContents();

            //Uploading & Psrsing file 
            var contentObject = fileParser.getInvoiceInstanceFromRawFile(fileContent);
            log.debug({
                title: 'sl_cn_txt_import fileResult',//file and function name
                details: contentObject
            });

            //            Assemble the response message
            var message = "";
            if (contentObject.exceptionMessage) {
                message = contentObject.exceptionMessage;
            }

            context.response.writePage({
                pageObject: importForm.createForm(message)
            });
        }
    }

    return {
        onRequest: onRequest
    };

});
