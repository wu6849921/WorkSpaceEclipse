/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */

define([
    '../../lib/commons',
    '../../dao/helper/search_helper',
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../lib/wrapper/ns_wrapper_config'

],

function(commons, helper, runtime, config) {

    function hasBankAccount(entries) {
        for ( var i in entries) {
            if (isBankAccount(entries[i])) {
                return true;
            }
        }
    }

    function isBankAccount(entry) {
        if (!commons.makesure(entry)) {
            return false;
        }
        return entry.getValue({
            name: 'type',
            join: 'account'
        }) === 'Bank';
    }

    function isDepositedPayment(params) {
        if (commons.makesure(params.tranEntries)) {
            var tranEntries = params.tranEntries;
            var depositTranEntries = params.depositTranEntries;
        } else {
            tranEntries = params;
            depositTranEntries = null;
        }

        if (hasBankAccount(tranEntries)) {
            return true;
        }

        if (commons.makesure(depositTranEntries)) {
            return true;
        }

        return false;
    }

    function hasSameAccountType(params) {
        if (!commons.makesureall(params, 'one') || !commons.makesureall(params, 'other')) {
            return false;
        }
        return params.one.getValue({
            name: 'type',
            join: 'account'
        }) === params.other.getValue({
            name: 'type',
            join: 'account'
        });
    }

    function hasCashflowItem(entry) {
        return commons.makesure(getCashflowItem(entry));
    }

    /**
     * NSCHINA-2314
     * @param params
     * @return cfs item value, if params is emtpy return undefined cfs
     */
    function getCashflowItem(params) {
        var entry = params;
        //inline array now records the line index with inline cfs item
        var inline = [];
        var lineIdx = -1;
        if (commons.makesure(params.entry)) {
            entry = params.entry;
            inline = params.inline;
            lineIdx = params.lineIndex;
        }
        if (!commons.makesure(entry)) {
            return;
        }

        if (inline.length !== 0 && inline.indexOf(lineIdx) > -1 &&  commons.makesure(entry.getValue('custcol_cseg_cn_cfi'))) {
            return entry.getValue(helper.column('internalid').reference('custcol_cseg_cn_cfi').create());
        }
        if (commons.makesure(entry.getValue('custbody_cseg_cn_cfi'))) {
            return entry.getValue(helper.column('internalid').reference('custbody_cseg_cn_cfi').create());
        }
}

    /**
     * NSCHINA-2314
     * @param  {Array} entries :  line items in transaction
     * @return {Array}: line index array whose line cfs value not empty, index starts from zero
     */
    function hasInlineCashflowItem(entries) {
        var results = [];
        for (var i = 0; i < entries.length; i++) {
            if (!isMainline(entries[i]) && commons.makesure(entries[i].getValue('custcol_cseg_cn_cfi'))) {
                results.push(i);
            }
        }
        return results;
    }



    function hasOnlyOneEntry(entries) {
        return commons.makesure(entries) && entries.length === 1;
    }

    function cashamount(params) {
        if (commons.isNumber(params)) {
            return params;
        }
        var amount = params.amount;
        var taxamount = params.taxamount;
        var taxrate = params.taxrate;
        if (commons.makesure(amount)) {
            if (commons.makesure(taxamount) && commons.makesure(taxrate)) {
                return amount * (1 + commons.toNumber(taxrate));
            } else {
                return amount;
            }
        }
    }

    function getDepositedBankAmount(params) {
        if (commons.makesure(params.tranEntries)) {
            var tranEntries = params.tranEntries;
            var depositTranEntries = params.depositTranEntries;
        } else {
            tranEntries = params;
            depositTranEntries = null;
        }
        for ( var i in tranEntries) {
            if (isBankAccount(tranEntries[i])) {
                return tranEntries[i].getValue('amount');
            }
        }
        if (commons.makesure(depositTranEntries)) {
            for ( var i in depositTranEntries) {
                if (isBankAccount(depositTranEntries[i])) {
                    return depositTranEntries[i].getValue('amount');
                }
            }
        }
    }

    function getCreditAmountAppliedOnPayment(params) {
        var amount = 0;

        if (!commons.makesure(params, 'creditTranEntries') || !commons.makesure(params, 'paidTranEntry')) {
            return amount;
        }

        var creditTranEntries = params.creditTranEntries;
        var paidTranEntry = params.paidTranEntry;
        for ( var i in creditTranEntries) {
            if (creditTranEntries[i].getValue({
                name: 'internalid',
                join: 'paidTransaction'
            }) === paidTranEntry.id) {
                amount += commons.toNumber(creditTranEntries[i].getValue('paidamount'));
            }
        }

        return amount;
    }

    function getAmountToRefDirection(amounts) {
        if (commons.isNumber(amounts)) {
            return amounts;
        }

        var refAmount = amounts.ref;
        var amount = amounts.amount;
        if (commons.makesure(refAmount) && commons.makesure(amount)) {
            return commons.sign(refAmount) * commons.toAbsNumber(amount);
        }
    }

    /**
     * @desc Check if transaction amount remaining to be paid is above zero. Return true if there is still amount remaining to be paid, return false otherwise.
     * @param {search.Result[]} entries - The transaction entries to be checked
     * @return {Boolean}
     */
    function isAmountRemainingAboveZero(entries) {
        for ( var i in entries) {
            if (entries[i].getValue('amountremainingisabovezero')) {
                return true;
            }
        }
        return false;
    }

    /**
     * @desc Check current entry is mainline or not.
     * @param {search.Result} entry - A transaction entry to be checked.
     * @return {Boolean}
     */
    function isMainline(entry) {
        return entry.getValue('mainline') === '*';
    }

    /**
     * @desc Find applied transactions.
     * @param {Object} params - applying record and sublistId
     * @returns {Array<Number>} applied transaction ids.
     */
    function getAppliedTransactions(params) {
        var applyingRecord = params.applyingRecord;
        var lineCount = applyingRecord.getLineCount({
            sublistId: params.sublistId
        });

        var internalIds = [];
        for (var line = 0; line < lineCount; line++) {
            var isApplied = applyingRecord.getSublistValue({
                sublistId: params.sublistId,
                fieldId: 'apply',
                line: line
            });

            if (isApplied) {
                internalIds.push(applyingRecord.getSublistValue({
                    sublistId: params.sublistId,
                    fieldId: 'internalid',
                    line: line
                }));
            }
        }

        return internalIds;
    }

    /**
     * @desc Assemble transaction entries into a map with key as transaction internal ID and values as the transaction entries.
     * @param {Array<search.Result>} entries - The transaction entries to be Assembled
     * @return {Object<String:Array<search.Result>} Assembled transaction entries
     */
    function assembleTransactionEntries(entries) {
        var assembledTranEntries = {};

        for (var i = 0; i < entries.length; i++) {
            if (!commons.makesure(assembledTranEntries[entries[i].id])) {
                assembledTranEntries[entries[i].id] = [];
            }
            assembledTranEntries[entries[i].id].push(entries[i]);
        }

        return assembledTranEntries;
    }

    function getCurrentSubsidiary(subsidiary){
        return runtime.isOW() ? subsidiary : config.getCompanyName();
    }

    return {
        isBankAccount: isBankAccount,
        hasBankAccount: hasBankAccount,
        isDepositedPayment: isDepositedPayment,
        hasSameAccountType: hasSameAccountType,
        getCashflowItem: getCashflowItem,
        hasCashflowItem: hasCashflowItem,
        hasInlineCashflowItem: hasInlineCashflowItem,
        hasOnlyOneEntry: hasOnlyOneEntry,
        cashamount: cashamount,
        getDepositedBankAmount: getDepositedBankAmount,
        getCreditAmountAppliedOnPayment: getCreditAmountAppliedOnPayment,
        getAmountToRefDirection: getAmountToRefDirection,
        isAmountRemainingAboveZero: isAmountRemainingAboveZero,
        isMainline: isMainline,
        getAppliedTransactions: getAppliedTransactions,
        assembleTransactionEntries: assembleTransactionEntries,
        getCurrentSubsidiary: getCurrentSubsidiary
    };

});
