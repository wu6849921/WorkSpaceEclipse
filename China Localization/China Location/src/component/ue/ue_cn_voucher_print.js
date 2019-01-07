/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NScriptName CN UE Voucher Print
 * @NScriptId _ue_cn_voucher_print
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../res/voucherresource'
],

function(runtime, resource) {

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} context
     * @param {Record} context.newRecord - New record
     * @param {string} context.type - Trigger type
     * @param {Form} context.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(context) {
        log.debug('runtime.executionContext', runtime.executionContext);
        log.debug('runtime.ContextType.USER_INTERFACE', runtime.ContextType.USER_INTERFACE);
        if (context.type === context.UserEventType.VIEW && runtime.executionContext === runtime.ContextType.USER_INTERFACE) {
            var journalForm = context.form;
            var labels = resource.load(resource.Name.Labels);
            journalForm.addButton({
                id: 'custpage_print_voucher_btn',
                label: labels.Print_Voucher,
                functionName: 'printVoucher'
            });
            journalForm.clientScriptModulePath = "../../app/voucher/app_cn_voucher_print.js";
        }
    }

    return {
        beforeLoad: beforeLoad
    };

});
