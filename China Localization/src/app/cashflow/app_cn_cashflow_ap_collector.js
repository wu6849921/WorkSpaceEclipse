/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../dao/cn_transaction_ap_dao',
    '../../dao/cn_cashflow_collector_dao',
    '../../lib/commons',
    '../../lib/wrapper/ns_wrapper_format',
    '../../lib/wrapper/ns_wrapper_record',
    '../helper/cashflow_helper'
],

function(apTransDao, collectorDao, commons, format, record, cashflowHelper) {
    var recordTypeWhiteList = [
        record.Type.VENDOR_PAYMENT,
        record.Type.CHECK,
        'VendPymt',
        'Check'
    ];

    var curDate = new Date();
    /*
     * @desc Collect payment related data.
     */
    function collect(tranid, collectParam, trantype) {
        log.debug('ap_collector', 'Enter collect, collectParam=' + JSON.stringify(collectParam));
        if (trantype === record.Type.VENDOR_PAYMENT || trantype === 'VendPymt') {
            var paidTransIdArray = []; // store billIds and
            // billCreditIds
            for ( var paidTransId in collectParam) {
                paidTransIdArray.push(paidTransId);
            }
            var transList = apTransDao.fetchAPTransaction(tranid, paidTransIdArray);
            log.debug('ap_collector', 'fetchAPTransaction, transList=' + JSON.stringify(transList));
            var result = [];
            for ( var transId in transList) {
                result = result.concat(processBill(transList[transId], tranid, collectParam[transId]));
            }
        } else if (trantype === record.Type.CHECK || trantype === 'Check') {
            var transList = apTransDao.fetchAPTransaction(tranid, tranid);
            var result = [];
            for ( var transId in transList) {
                result = result.concat(processCheck(transList[transId], tranid));
            }
        }

        return result;
    }

    function processBill(bill, tranid, paymentApplyInfo) {
        var mainline = bill.mainline;
        mainline.paymentAmount = paymentApplyInfo.amount;
        //NSCHINA-2314
        mainline.useHeaderCFI = useHeaderCFIOnLine(bill.itemlines);
        mainline.paymentPeriod = paymentApplyInfo.period;
        mainline.paymentDate = paymentApplyInfo.transDate;
        mainline.paymentId = tranid;
        mainline.paymentSubsidiary = cashflowHelper.getCurrentSubsidiary(paymentApplyInfo.subsidiary);
        // Fully paid by multiple payments, go to partial pay process
        if (mainline.paidInFull) {
            return saveFinalPayItemLines(bill.itemlines, mainline);
        } else {
            return saveItemLines(bill.itemlines, mainline);
        }
    }

    function processCheck(check, tranid) {
        var mainline = check.mainline;
        mainline.paymentAmount = commons.toAbsNumber(mainline.totalAmount);
        mainline.totalAmount = commons.toAbsNumber(mainline.totalAmount);
        mainline.useHeaderCFI = useHeaderCFIOnLine(check.itemlines);
        mainline.paymentPeriod = mainline.period;
        mainline.paymentDate = mainline.transDate;
        mainline.paymentId = tranid;
        mainline.paymentSubsidiary = mainline.subsidiary;
        return saveItemLines(check.itemlines, mainline);
    }

    function saveItemLines(itemLines, mainline) {
        var paidAmt = 0;
        var result = [];

        for (var i = 0; i < itemLines.length - 1; i++) {
            var item = itemLines[i];
            var saveObj = composeLineResult(item, mainline, i);
            saveObj.amount = format.round(item.amount * mainline.paymentAmount / (commons.toNumber(mainline.totalAmount) + commons.toNumber(mainline.advToApplyAmount)));
            log.debug('saveObj.amount', saveObj.amount);
            paidAmt += saveObj.amount;
            result.push(saveObj);
        }
        //last item line amount = total amount - sum (previous line amount)
        var resultitem = itemLines[itemLines.length - 1];
        var saveResultObj = composeLineResult(resultitem, mainline, i);
        log.debug('paidAmt', paidAmt);
        saveResultObj.amount = mainline.paymentAmount - paidAmt;
        log.debug('saveResultObj.amount', saveResultObj.amount);
        result.push(saveResultObj);
        return result;
    }

    // param.useHeaderCFI - whether to use the CFI defined in header
    // param.headerCFI - if available
    // param.billId - bill internal id
    // param.billAmt - bill total amount
    function saveFinalPayItemLines(itemLines, mainline) {
        var result = [];
        var prevBillCollectedAmt = 0;
        for (var i = 0; i < itemLines.length; i++) {
            var item = itemLines[i];
            var saveObj = composeLineResult(item, mainline, i);
            var itemcollectedAmt = collectorDao.queryLineCollectedAmt(item.lineuniquekey);
            saveObj.amount = item.amount - itemcollectedAmt;
            prevBillCollectedAmt += itemcollectedAmt;
            result.push(saveObj);
        }

        // Left matches Expense has advance to apply
        // No matter it is Expense Pay in Full or Last Payment
        // Right matches there is discount taken in payment or foreign currency rate exchange
        // Both condition should force calculation in percentage
        if (mainline.advToApplyAmount !== 0 || ((prevBillCollectedAmt + mainline.paymentAmount) !== mainline.totalAmount)) {
            return saveItemLines(itemLines, mainline);
        } else {
            return result;
        }
    }

    /**
     * NSCHINA-2314
     * @param itemLines
     * @returns {Array} line index for those needs to apply header cfs (those lines whose cfs is empty), line index start from zero
     */
    function useHeaderCFIOnLine(itemLines) {
        var useHeadLines = [];
        for (var i = 0; i < itemLines.length; i++) {
            if (!commons.makesure(itemLines[i].cfsItem)) {
                useHeadLines.push(i);
            }
        }
        return useHeadLines;
    }


    function matches(tranType) {
        return recordTypeWhiteList.indexOf(tranType) !== -1;
    }

    function composeLineResult(item, mainline, indexNum) {
        var saveResultObj = {};
        saveResultObj.dateCreated = curDate;
        saveResultObj.paidTranid = mainline.transId;
        saveResultObj.pymtTranid = mainline.paymentId;
        saveResultObj.parentid = mainline.tranid;
        saveResultObj.subsidiary = mainline.paymentSubsidiary;
        saveResultObj.period = mainline.paymentPeriod;
        saveResultObj.trandate = format.parseDate(mainline.paymentDate);
        //NSCHINA-2314
        if (mainline.useHeaderCFI.indexOf(indexNum) > -1) {
            saveResultObj.item = mainline.cfsItem;
        } else {
            saveResultObj.item = item.cfsItem;
        }
        saveResultObj.lineUniqueKey = item.lineuniquekey;
        //NSCHINA-2429
        //Add location/department/class to CFS ap collector
        saveResultObj.location = item.location;
        saveResultObj.department = item.department;
        saveResultObj.classification = item.classification;
        return saveResultObj;
    }

    return {
        collect: collect,
        matches: matches
    };

});
