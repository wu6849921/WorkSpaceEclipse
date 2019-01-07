/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/commons',
    '../../lib/wrapper/ns_wrapper_require',
    '../../res/pref/prefresource-client'
], function(commons, require, resource) {

    function pageInit(context) {
    }

    function fieldChanged(context) {
    }

    function cancel() {
        window.history.back();
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        cancel: cancel
    };

});
