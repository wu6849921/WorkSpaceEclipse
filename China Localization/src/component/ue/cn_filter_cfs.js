/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 */
var cfsFilter = (function() {
    NS.jQuery(document).ready(function() {
        var inOutFlowObj = fetchInOutValues();
        load(inOutFlowObj);
    });
    function load(inOutFlowObj) {
        var functionalityCreateDiv = NLDropdown.prototype.createDiv;
        NLDropdown.prototype.createDiv = function() {
            if (('custbody_cseg_cn_cfi' === this.name || 'custcol_cseg_cn_cfi' === this.name)) {
                try {
                    var functionalityCreateDivResult = functionalityCreateDiv.apply(this, arguments);
                    var tranType = nlapiGetRecordType();
                    if (tranType === 'journalentry') {
                        var cfsType = getCfsTypeFromJournalEntry();
                    } else {
                        //handle other transaction type
                        cfsType = getCfsTypeExceptJournalEntry(tranType);
                    }
                    if (!NS.jQuery.isEmptyObject(inOutFlowObj)) {
                        var expectedCFS = searchCFS(cfsType, inOutFlowObj);
                        filterDiv(functionalityCreateDivResult, expectedCFS);
                    }
                    return functionalityCreateDivResult;
                } catch (e) {
                    return functionalityCreateDiv.apply(this, arguments);
                }
            } else {
                return functionalityCreateDiv.apply(this, arguments);
            }

        };
        var functionalityOpen = NLDropdown.prototype.open;
        NLDropdown.prototype.open = function() {
            if (('custbody_cseg_cn_cfi' === this.name || 'custcol_cseg_cn_cfi' === this.name)) {
                try {
                    this.div = null;
                    var functionalityOpenResult = functionalityOpen.apply(this, arguments);
                    return functionalityOpenResult;
                } catch (e) {
                    return functionalityOpen.apply(this, arguments);
                }
            } else {
                return functionalityOpen.apply(this, arguments);
            }
        }
    }
    function filterDiv(div, expectedArray) {
        var children = NS.jQuery(div).children();
        children.each(function() {
            var child = NS.jQuery(this);
            var lineValue = child.text().trim();
            if (expectedArray.indexOf(lineValue) >= 0 || lineValue === '' || lineValue === '- New -') {
                child.css("display", "block");
            } else {
                child.css("display", "none");
            }
        });
    }
    function getCfsTypeExceptJournalEntry(tranType) {
        var inFlowTranType = [
            'customerrefund',
            'customerdeposit',
            'cashsale',
            'invoice',
            'salesorder',
            'creditmemo',
            'customercharge',
            'returnauthorization',
            'cashrefund'
        ];
        var outFlowTranType = [
            'check',
            'purchaseorder',
            'vendorbill',
            'vendorcredit',
            'expensereport',
            'vendorreturnauthorization'
        ];

        if (inFlowTranType.indexOf(tranType) > -1) {
            var cfsType = 'IN';
        } else if (outFlowTranType.indexOf(tranType) > -1) {
            cfsType = 'OUT';
        }
        return cfsType;
    }
    function processCfsTypeByAmount(creditAmount, debitAmount) {
        var targetCfsType;
        if ((creditAmount && parseFloat(creditAmount) > 0) || (debitAmount && parseFloat(debitAmount) < 0)) {
            targetCfsType = 'IN';
        } else if ((creditAmount && parseFloat(creditAmount) < 0) || (debitAmount && parseFloat(debitAmount) > 0)) {
            targetCfsType = 'OUT';
        }
        return targetCfsType;
    }
    function getCfsTypeFromJournalEntry() {
        var creditAmount = nlapiGetCurrentLineItemValue('line', 'credit');
        var debitAmount = nlapiGetCurrentLineItemValue('line', 'debit');
        return processCfsTypeByAmount(creditAmount, debitAmount);
    }
    function fetchInOutValues() {
        var CASHFLOWTYPE = {
            INFLOW: {
                ENLABEL: 'IN',
                CNLABEL: '\u6D41\u5165'
            },
            OUTFLOW: {
                ENLABEL: 'OUT',
                CNLABEL: '\u6D41\u51FA'
            }
        };

        var language = nlapiGetContext().getPreference('language');
        var inOutFlowObj = {};
        if (language === 'zh_CN') {
            inOutFlowObj.inFlow = getListValue(CASHFLOWTYPE.INFLOW.CNLABEL);
            inOutFlowObj.outFlow = getListValue(CASHFLOWTYPE.OUTFLOW.CNLABEL);
        } else if (language.indexOf('en') !== -1) {
            //Including English Internalial/GB/UK/US
            inOutFlowObj.inFlow = getListValue(CASHFLOWTYPE.INFLOW.ENLABEL);
            inOutFlowObj.outFlow = getListValue(CASHFLOWTYPE.OUTFLOW.ENLABEL);
        } else {
            //other language
            return inOutFlowObj;
        }
        return inOutFlowObj;
    }
    function getListValue(value) {
        var filters = [];
        filters.push(new nlobjSearchFilter('name', null, 'is', value));
        var columns = [];
        columns.push(new nlobjSearchColumn('internalid'));
        var searchresults = nlapiSearchRecord('customlist_cn_cfi_in_out_flow', null, filters, columns);
        var resultId;
        if (searchresults !== null) {
            resultId = searchresults[0].id;
        }
        return resultId;
    }
    function searchCFS(cfsType, inOutFlowObj) {
        var filters = [];
        if (cfsType) {
            var cfsTypeId = cfsType === 'IN' ? inOutFlowObj.inFlow : inOutFlowObj.outFlow;
            filters = [
                [
                    'custrecord_cash_in_out_flow',
                    'is',
                    cfsTypeId
                ]
            ];
        }

        var columns = [];
        columns[0] = new nlobjSearchColumn('name');
        var searchresults = nlapiSearchRecord('customrecord_cseg_cn_cfi', null, filters, columns);
        var expectedCFS = [];
        for (var i = 0; searchresults != null && i < searchresults.length; i++) {
            var searchresult = searchresults[i];
            var name = searchresult.getValue('name');
            expectedCFS[i] = name;
        }
        return expectedCFS;
    }
    return {
        'getCfsTypeExceptJournalEntry': getCfsTypeExceptJournalEntry,
        'processCfsTypeByAmount': processCfsTypeByAmount,
        'getCfsTypeFromJournalEntry': getCfsTypeFromJournalEntry,
        'fetchInOutValues': fetchInOutValues,
        'getListValue': getListValue,
        'searchCFS': searchCFS,
        'load': load,
        'filterDiv': filterDiv
    }
}());
