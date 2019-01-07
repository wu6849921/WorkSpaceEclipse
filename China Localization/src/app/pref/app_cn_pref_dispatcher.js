/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */

define([
    '../vat/pref/app_cn_vat_pref_handler',
    '../cashflow/pref/app_cn_cashflow_pref_handler'
],

function(vatHandler, cashflowHandler) {

    var handlers = [
        vatHandler,
        cashflowHandler
    ];

    function dispatch(params) {
        for (var featureId in params) {
            for (var j = 0; j < handlers.length; j++) {
                if (handlers[j].isMatchedFeature(featureId)) {
                    handlers[j].handle(params[featureId]); // should disable or enable the feature
                    break;
                }
            }
        }
    }

    return {
        dispatch: dispatch
    };
    
});
