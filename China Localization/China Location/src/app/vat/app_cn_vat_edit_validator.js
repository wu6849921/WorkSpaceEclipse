/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    '../../lib/commons',
    '../../res/vat/vatresource-client',
    '../../lib/wrapper/ns_wrapper_error',
    '../../constant/constant_cn_vat',
    './app_cn_vat_data_helper',
    './app_cn_vat_saleslist'
],

function(commons, resource, error, constant, dataHelper, salesList) {

    var labels = resource.load(resource.Name.Labels);
    var message = resource.load(resource.Name.Errors);

    function validate(rule) {
        if (!commons.isArray(rule)) {
            rule.apply(this);
        } else {
            for (var i = 0; i < rule.length; i++) {
                rule[i].apply(this);
            }
        }
        if (commons.makesure(this.errorMessages)) {
            if(!commons.convince(this.errorMessages)){
                throw error.create({
                    name: error.UnexpectedError,
                    message: message.ErrorMessageEmpty
                });
            }

            throw error.create({
                name: error.UserError,
                message: this.errorMessages.join('<br>')
            });
        }
    }

    /**
     * @desc If no valid transactions to merge. OR If select nothing or select unique transaction
     * For now, only process select nothing case.
     */
    function noValidTransToMerge() {
        if (!commons.makesure(this.selectedLines)) {
            this.errorMessages.push(message.NoValidTranToMerge);
        }
        if (this.selectedLines.length === 1 && commons.ensure(this.isGroupSameItems)) {
            var identity = dataHelper.id({
                line: this.selectedLines[0],
                form: this.form
            });            
            var items = dataHelper.data(this.theData).getItemsByIdentity(identity);            
            var hasSameItems = false;
            for (var j = 0; j < items.length; j++) {
                for (var k = j + 1; k < items.length; k++) {
                    if (dataHelper.data().isSameItem(items[j], items[k])) {
                        hasSameItems = true;
                        break;
                    }
                }
                if(hasSameItems){
                    break;
                }
            }
            if (!hasSameItems) {
                this.errorMessages.push(message.NoValidTranToMerge);
            }
        }
    }

    /**
     * @desc The selected transactions cannot exceed the CHINA MAX VAT INVOICE AMOUNT {Max amount}.
     */
    function exceedMaxAmount() {
        var maxAmount = this.form.getValue('custpage_maxinvoiceamount');
        if (commons.ensure(maxAmount)) {
            var totalAmountAfterDiscount = 0.00;
            for (var i = 0; i < this.selectedLines.length; i++) {
                var amountAfterDiscount = this.form.getSublistValue({
                    sublistId: 'custpage_header_sublist',
                    fieldId: 'custpage_amount_after_discount',
                    line: this.selectedLines[i]
                });
                totalAmountAfterDiscount += commons.ensure(amountAfterDiscount) ? amountAfterDiscount : 0.00;
            }
            if (totalAmountAfterDiscount > maxAmount) {
                var errorMessage = message.TotalAmountExceedMax.replace('$maxAmount', maxAmount);
                this.errorMessages.push(errorMessage);
            }
        }
    }

    /**
     * @desc The consolidated and split transactions cannot be merged again.
     */
    function reMergeConsolidatedTrans() {
        for (var i = 0; i < this.selectedLines.length; i++) {
            var status = this.form.getSublistValue({
                sublistId: 'custpage_header_sublist',
                fieldId: 'custpage_status',
                line: this.selectedLines[i]
            });
            if (commons.ensure(status) && status === labels.consolidated) {
                this.errorMessages.push(message.ConsolidatedSplitTranCannotMerge);
                break;
            }
        }
    }

    /**
     * @desc No valid selected transactions to unmerge
     */
    function noSummaryTransToUnmerge() {
        if (!commons.makesure(this.selectedLines)) {
            this.errorMessages.push(message.NoSummaryTransToUnmerge);
        }
        for (var i = 0; i < this.selectedLines.length; i++) {
            var status = this.form.getSublistValue({
                sublistId: 'custpage_header_sublist',
                fieldId: 'custpage_status',
                line: this.selectedLines[i]
            });
            if (!commons.ensure(status) || status !== labels.consolidated) {
                this.errorMessages.push(message.NoSummaryTransToUnmerge);
                return;
            }
        }
    }

    /**
     * @desc Only transactions with same customer can be consolidated.
     */
    function mergeTransOfDifferentCustomers() {
        var preCustomer = null;
        for (var i = 0; i < this.selectedLines.length; i++) {
            var customer = this.form.getSublistValue({
                sublistId: 'custpage_header_sublist',
                fieldId: 'custpage_customer',
                line: this.selectedLines[i]
            });
            if (!commons.ensure(preCustomer)) {
                preCustomer = customer;
            } else if (preCustomer !== customer) {
                this.errorMessages.push(message.MergeDifferentCustomers);
                return;
            }
        }
    }

    /**
     * @desc Only for special invoice, merge negative transactions.
     * 1. sheet number is null
     * 2. sheet number is different
     */
    function sheetNumberNullOrDifferent() {
        var invoiceType = commons.toNumber(this.filter.invoiceType);
        var invoices = this.theData.invoices, preSheetNumber = null;
        var hasNullSheetNumber = false, hasDifferentSheetNumber = false;

        if (invoiceType === constant.INVOICE_TYPE.SPECIAL_INVOICE) {
            for (var i = 0; i < this.selectedLines.length; i++) {
                var identity = dataHelper.id({
                    line: this.selectedLines[i],
                    form: this.form
                });
                for (var j = 0; j < invoices.length; j++) {
                    if (identity === dataHelper.id({
                        transaction: invoices[j]
                    })) {
                        if (!isNegativeTransaction(invoices[j].type)) { // this check only applies to negative trans
                            return;
                        }
                        if (!commons.ensure(invoices[j].inforSheetNumber)) { // check sheet number null
                            hasNullSheetNumber = true;
                            break;
                        }
                        if (!commons.ensure(preSheetNumber)) {
                            preSheetNumber = invoices[j].inforSheetNumber;
                        } else if (preSheetNumber !== invoices[j].inforSheetNumber) { // check sheet number different
                            hasDifferentSheetNumber = true;
                            break;
                        }
                        break;
                    }
                }
            }
            if (commons.ensure(hasNullSheetNumber)) {
                this.errorMessages.push(message.BlankSheetNumber);
            }
            if (commons.ensure(hasDifferentSheetNumber)) {
                this.errorMessages.push(message.DifferentSheetNumber);
            }
        }
    }

    /**
     * @desc Only for common invoice, merge negative transactions.
     * 1. should apply CM or CR to VAT invoice firstly.
     * 2. CM or CR can only be applied to one VAT invoice.
     * 3. Invoice does not have VAT info or has remarks that are in incorrect format.
     * 4. VATCode and VATNumber are different
     */
    function codeNumberNullOrDifferent() {
        var invoiceType = commons.toNumber(this.filter.invoiceType);
        var invoices = this.theData.invoices, hasNoAppliedVAT = false, hasMoreThanOneAppliedVAT = false, hasNoVATInfo = false, hasDifferentVATInfo = false;
        var preVATCode = null, preVATNumber = null;        

        if (invoiceType === constant.INVOICE_TYPE.COMMON_INVOICE) {
            for (var i = 0; i < this.selectedLines.length; i++) {
                if (commons.ensure(hasNoAppliedVAT) && commons.ensure(hasMoreThanOneAppliedVAT) && commons.ensure(hasNoVATInfo)) {
                    break;
                }
                var identity = dataHelper.id({
                    line: this.selectedLines[i],
                    form: this.form
                });
                for (var j = 0; j < invoices.length; j++) {
                    if (identity === dataHelper.id({
                        transaction: invoices[j]
                    })) {
                        if (!isNegativeTransaction(invoices[j].type)) { // this check only applies to negative trans
                            return;
                        }
                        var errMsg = invoices[j].errMsg;
                        if (errMsg === message.NoAppliedVAT) {
                            hasNoAppliedVAT = true;
                        } else if (errMsg === message.MoreThanOneAppliedVAT) {
                            hasMoreThanOneAppliedVAT = true;
                        } else if (errMsg === message.NoVATInfo) {
                            hasNoVATInfo = true;
                        } else {
                            if (!commons.ensure(preVATCode)) {
                                preVATCode = invoices[j].VATCode;
                            } else if (preVATCode !== invoices[j].VATCode) { // check VATCode and VATNumber different
                                hasDifferentVATInfo = true;
                            }
                            if (!commons.ensure(preVATNumber)) {
                                preVATNumber = invoices[j].VATNumber;
                            } else if (preVATNumber !== invoices[j].VATNumber) { // check VATCode and VATNumber different
                                hasDifferentVATInfo = true;
                            }
                        }
                        break;
                    }
                }
            }
            if (commons.ensure(hasNoAppliedVAT)) {
                this.errorMessages.push(message.NoAppliedVAT);
            }
            if (commons.ensure(hasMoreThanOneAppliedVAT)) {
                this.errorMessages.push(message.MoreThanOneAppliedVAT);
            }
            if (commons.ensure(hasNoVATInfo)) {
                this.errorMessages.push(message.NoVATInfo);
            }
            if (commons.ensure(hasDifferentVATInfo)) {
                this.errorMessages.push(message.DifferentVATCodeAndNumber);
            }
        }
    }

    /**
     * @desc Consolidated transaction has more than 8 lines but sales list is not enabled.
     */
    function exceedMaxItemAmount() {
        if (isSalesListYesSelected(this.filter.salesList)) {
            return;
        }
        var theItems = [];
        for (var i = 0; i < this.selectedLines.length; i++) {
            var identity = dataHelper.id({
                line: this.selectedLines[i],
                form: this.form
            });
            theItems = theItems.concat(dataHelper.data(this.theData).getItemsByIdentity(identity));
        }
        if (commons.ensure(this.isGroupSameItems)) {
            theItems = dataHelper.data().groupSameItems(theItems);
        }
        if (salesList.isSalesListApplicable(theItems)) {
            this.errorMessages.push(message.ExceedMaxItemAmount);
        }
    }

    /**
     * @desc Merge positive and negative transactions while group same items is disabled.
     */
    function mergePositiveNegativeTrans() {
        var hasNegativeTran = false, hasPositiveTran = false;
        for (var i = 0; i < this.selectedLines.length; i++) {
            var identity = dataHelper.id({
                line: this.selectedLines[i],
                form: this.form
            });
            for (var j = 0; j < this.theData.invoices.length; j++) {
                var transaction = this.theData.invoices[j];
                if (dataHelper.id({
                    transaction: transaction
                }) === identity) {
                    if (isNegativeTransaction(transaction.type)) {
                        hasNegativeTran = true;
                    } else {
                        hasPositiveTran = true;
                    }
                    break;
                }
            }
            if (commons.ensure(hasNegativeTran) && commons.ensure(hasPositiveTran)) {
                if (!commons.ensure(this.isGroupSameItems)) {
                    this.errorMessages.push(message.MergePosiNegaWithGroupItemDisabled);
                } else {
                    var theItems = [];
                    for (var k = 0; k < this.selectedLines.length; k++) {
                        var identity = dataHelper.id({
                            line: this.selectedLines[k],
                            form: this.form
                        });
                        theItems = theItems.concat(dataHelper.data(this.theData).getItemsByIdentity(identity));
                    }
                    theItems = dataHelper.data().groupSameItems(theItems);
                    for (var k = 0; k < theItems.length; k++) {
                        if (theItems[k].taxexclusiveamt < 0) {
                            this.errorMessages.push(message.MergePosiNegaWithNegtiveItemAmount);
                            break;
                        }
                    }
                }
                return;
            }
        }
    }

    /**
     * @desc Merge single transaction while group same items is disabled.
     */
    function mergeSingleTranWithGroupItemDisabled() {
        if (this.selectedLines.length === 1 && !commons.ensure(this.isGroupSameItems)) {
            this.errorMessages.push(message.MergeSingleTranWithGroupItemDisabled);
        }
    }

    function isSalesListYesSelected(salesList) {
        return salesList === '0';
    }

    function isNegativeTransaction(tranType) {
        return tranType === 'CustCred' || tranType === 'CashRfnd';
    }

    function data(data) {
        return {
            errorMessages: [],
            theData: data.data,
            form: data.form,
            selectedLines: data.selectedLines,
            filter: data.filter,
            isGroupSameItems: data.isGroupSameItems,
            validate: validate
        };
    }

    var validator = {
        data: data
    };

    var rules = {
        noValidTransToMerge: noValidTransToMerge,
        exceedMaxAmount: exceedMaxAmount,
        reMergeConsolidatedTrans: reMergeConsolidatedTrans,
        noSummaryTransToUnmerge: noSummaryTransToUnmerge,
        mergeTransOfDifferentCustomers: mergeTransOfDifferentCustomers,
        sheetNumberNullOrDifferent: sheetNumberNullOrDifferent,
        codeNumberNullOrDifferent: codeNumberNullOrDifferent,
        exceedMaxItemAmount: exceedMaxItemAmount,
        mergePositiveNegativeTrans: mergePositiveNegativeTrans,
        mergeSingleTranWithGroupItemDisabled: mergeSingleTranWithGroupItemDisabled
    };

    Object.defineProperty(validator, 'Rule', {
        enumerable: true,
        get: function() {
            return rules;
        }
    });

    return validator;

});
