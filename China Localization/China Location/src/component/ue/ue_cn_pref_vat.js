/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 */
define([
    '../../app/vat/pref/app_cn_vat_pref_custfield_handler',
    '../../lib/wrapper/ns_wrapper_runtime'
],

function(customFieldHandler, runtime) {

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {
        if (runtime.executionContext === runtime.ContextType.USER_INTERFACE) {
            customFieldHandler.handle({
                form: scriptContext.form
            });
        }
    }

    return {
        beforeLoad: beforeLoad
    };
    
});
