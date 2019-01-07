/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    '../../lib/wrapper/ns_wrapper_format'
],

function(formatter) {
    /*
     * @desc Collect payment related data.
     * @param {object} [payment] - payment information.
     * @return payment apply information array.
     */
    function fetchPymtApplyInfo(pymtRecord, triggerType) {
        if (!pymtRecord || triggerType === 'delete') {
            return {};
        }
        var pymAppliedItems = {};
        var applyLineCount = pymtRecord.getLineCount({
            sublistId: 'apply'
        });
        var transDate = formatter.formatDateTime(pymtRecord.getValue('trandate'));
        var period = pymtRecord.getValue('postingperiod');
        var subsidiary = pymtRecord.getValue('subsidiary');
        var exchangeRate = pymtRecord.getValue('exchangerate');
        for (var i = 0; i < applyLineCount; i++) {
            var item = {};
            var applied = pymtRecord.getSublistValue({
                sublistId: 'apply',
                fieldId: 'apply',
                line: i
            });
            if (applied) {
                item.amount = pymtRecord.getSublistValue({
                    sublistId: 'apply',
                    fieldId: 'amount',
                    line: i
                });
                item.internalid = pymtRecord.getSublistValue({
                    sublistId: 'apply',
                    fieldId: 'internalid',
                    line: i
                });
                item.trantype = pymtRecord.getSublistValue({
                    sublistId: 'apply',
                    fieldId: 'trantype',
                    line: i
                });
                item.discAmount = pymtRecord.getSublistValue({
                    sublistId: 'apply',
                    fieldId: 'disc',
                    line: i
                });
                item.amount = item.amount * exchangeRate;// + collector.queryBillAppliedCreditAmt(item.internalid, pymtRecord.id);
                item.transDate = transDate;
                item.period = period;
                item.subsidiary = subsidiary;
                pymAppliedItems[item.internalid] = item;
            }
        }
        return pymAppliedItems;
    }

    return {
        fetchPymtApplyInfo: fetchPymtApplyInfo
    };

});
