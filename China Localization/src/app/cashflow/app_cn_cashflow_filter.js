/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    '../../lib/wrapper/ns_wrapper_search',
    '../../lib/commons'
], function(search, common) {

    function getInOrOut(cfsvalue) {
        var result = "";
        if (common.makesure(cfsvalue)) {
            var cfsTypeSearch = search.create({
                type: 'customrecord_cseg_cn_cfi',
                filters: [
                    {
                        name: 'internalid',
                        operator: search.Operator.IS,
                        values: cfsvalue
                    }
                ],
                columns: [
                    search.createColumn({
                        name: 'custrecord_cash_in_out_flow'
                    })
                ],
            });
            var inOutFlowResult = cfsTypeSearch.run().getRange({
                start: 0,
                end: 1
            }) || [];

            for ( var i in inOutFlowResult) {
                var line = inOutFlowResult[i];
                result = line.getText('custrecord_cash_in_out_flow');
            }
        }
        return result;
    }

    var api = {
        isClearCfsItem: function(currentRec, sublistId, fieldId) {
            if (sublistId === 'line') {
                //get current cfs item
                var currentCfs = currentRec.getCurrentSublistValue({
                    sublistId: sublistId,
                    fieldId: 'custcol_cseg_cn_cfi'
                });

                var amount = currentRec.getCurrentSublistValue({
                    sublistId: sublistId,
                    fieldId: fieldId
                });

                if (!common.makesure(amount)) {
                    return true;
                }

                if (!common.makesure(currentCfs))
                    return;

                if (getInOrOut(currentCfs) === 'IN' || getInOrOut(currentCfs) === '\u6D41\u5165'.valueOf()) {
                    if ((fieldId === 'credit' && common.toNumber(amount) <= 0) || (fieldId === 'debit' && common.toNumber(amount) >= 0)) {
                        return true;
                    }
                } else if (getInOrOut(currentCfs) === 'OUT' || getInOrOut(currentCfs) === '\u6D41\u51FA'.valueOf()) {
                    if ((fieldId === 'credit' && common.toNumber(amount) >= 0) || (fieldId === 'debit' && common.toNumber(amount) <= 0)) {
                        return true;
                    }
                }
            }
            return false;
        }
    };

    api._getInOrOut = getInOrOut;
    return api;
});
