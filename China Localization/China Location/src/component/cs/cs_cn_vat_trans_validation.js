/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/commons',
    '../../app/vat/app_cn_vat_trans_validation',
    '../../lib/wrapper/ns_wrapper_dialog'
],

function(commons, transValidation, dialog) {

    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
           if(scriptContext.mode === 'edit'){

               var order = scriptContext.currentRecord;
               var cacheMessage = JSON.parse(order.getValue({
                   fieldId: 'custpage_cachefield'
               }));

               var warningMsg = transValidation.checkCNVATStatus(order, cacheMessage); // Need Custom Records -> China VAT Invoices (View) permission
               
               if (warningMsg !== null && warningMsg.length > 1) {
                           dialog.alert({
                               title: cacheMessage.warningMessage.invoiceEditWarningTitle,
                               message: warningMsg
                           });
               }
           }
    }


    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
        var msgs;
        var curRecord = scriptContext.currentRecord;
        var cacheMessage = JSON.parse(curRecord.getValue({
            fieldId: 'custpage_cachefield'
        }));

        msgs = transValidation.validatePageFields(curRecord, cacheMessage);

        if (msgs.length > 1) {
            dialog.alert({
                title: cacheMessage.errorMessage.Error,
                message: msgs
            });
            return false;
        }
        return true;
    }



    return {
        pageInit: pageInit,
        saveRecord: saveRecord
    };

});
