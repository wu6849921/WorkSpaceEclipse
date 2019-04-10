/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../lib/wrapper/ns_wrapper_search'
],

function(search) {

    /**
     * @desc fetch cash flow items defined in custom segment
     * @return {object} - the object whose key is the internal id of the cash flow item in custom segment, 
     *                    the value is the value defined in the custom segment. Note that the value will
     *                    only be in en_us
     */
    function fetchCashFlowItems() {
        // Search and get all the cash flow items, we should not have more than 1000 cash flow items
        var cfsItems = search.create({
            type: 'customrecord_cseg_cn_cfi',
            columns: 'name'
        }).run().getRange({
            start: 0,
            end: 1000
        }) || [];
        var result = {};
        for ( var idx in cfsItems) {
            var id = cfsItems[idx].id;
            var name = cfsItems[idx].getValue('name');
            result[id] = name;
        }

        return result;
    }

    return {
        fetchCashFlowItems: fetchCashFlowItems
    };

});
