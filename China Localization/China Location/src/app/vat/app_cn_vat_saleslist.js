/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    '../../lib/commons',
    '../../constant/constant_cn_vat'
],

function(commons, constant) {

    function isSalesListApplicable(currItems) {
        if (!commons.makesure(currItems)) {
            return false;
        }
        var totalRealLineCount = 0;
        for (var i = 0; i < currItems.length; i++) {
            var realCurrLineQuantity = hasDiscount(currItems[i])
                ? 2 : 1;
            totalRealLineCount += realCurrLineQuantity;
            if (totalRealLineCount > constant.SPLIT_LINE_LIMIT) {
                return true;
            }
        }
        return false;
    }

    function hasDiscount(currItem) {
        if (commons.toNormalizedNumber(currItem.discountamt) === 0) {
            return false;
        }
        return true;
    }

    return {
        isSalesListApplicable: isSalesListApplicable
    };
});
