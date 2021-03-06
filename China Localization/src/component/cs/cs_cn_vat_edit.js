/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/wrapper/ns_wrapper_require',
    '../../constant/constant_cn_vat',
    '../../lib/wrapper/ns_wrapper_https',
    '../../lib/wrapper/ns_wrapper_url',
    '../../lib/commons',
    '../../app/helper/serverWidget_helper',
    '../../app/vat/app_cn_vat_data_helper',
    './app_cn_vat_render_helper',
    '../../lib/wrapper/ns_wrapper_format',
    '../../res/vat/vatresource-client',
    '../../lib/util',
    '../../lib/wrapper/ns_wrapper_error',
    '../../app/vat/app_cn_vat_edit_validator',
    '../../res/common/commonresource-client',
    '../../app/vat/app_cn_vat_saleslist',
    '../../dao/cn_vat_sequence_dao'
],

function(require, consts, https, url, commons, serverWidgetHelper, dataHelper, renderHelper, format, resource, util, error, editValidator, commonResource, saleslist, seqDao) {

    var theData;
    var selectedLines = [];

    var message = resource.load(resource.Name.Errors);
    var labels = resource.load(resource.Name.Labels);
    var buttons = commonResource.load(commonResource.Name.Labels);

    function merge() {
        try {
            doMerge();
        } catch (ex) {
            handleError(ex);
        }
    }

    function doMerge() {
        collectSelectedLines();
        var isGroupSameItemsChecked = renderHelper.isElementChecked('custpage_groupsameitems');
        validator().validate([
            editValidator.Rule.noValidTransToMerge,
            editValidator.Rule.exceedMaxAmount,
            editValidator.Rule.reMergeConsolidatedTrans,
            editValidator.Rule.mergeTransOfDifferentCustomers,
            editValidator.Rule.sheetNumberNullOrDifferent,
            editValidator.Rule.codeNumberNullOrDifferent,
            editValidator.Rule.exceedMaxItemAmount,
            editValidator.Rule.mergePositiveNegativeTrans,
            editValidator.Rule.mergeSingleTranWithGroupItemDisabled
        ]);

        var childTranIds = [];
        for (var i = 0; i < selectedLines.length; i++) {
            var identity = id({line: selectedLines[i]});
            childTranIds.push(identity);
        }
        // The functions lineInit and reRenderTable will be triggered and selectedLines will be re-collect by move of lines.
        var childTranLineNos = commons.clone(selectedLines);
        for (var j = 0; j < childTranLineNos.length; j++) {
            serverWidgetHelper.form(form()).moveLine({
                sublistId: 'custpage_header_sublist',
                from: childTranLineNos[j],
                to: childTranLineNos[0],
                fieldValue: function(form, line, fieldId) {
                    if (fieldId === 'custpage_status') {
                        return labels.consolidated;
                    } else {
                        return form.getSublistValue({
                            sublistId: 'custpage_header_sublist',
                            fieldId: fieldId,
                            line: line
                        });
                    }
                },
                fieldIds: [
                    'custpage_internalid',
                    'custpage_type',
                    'custpage_status',
                    'custpage_doc_number',
                    'custpage_doc_date',
                    'custpage_customer',
                    'custpage_tax_excl_amount',
                    'custpage_amount_after_discount'
                ]
            });
        }
        var summaryTranInternalId = insertSummaryLine(childTranLineNos);

        // update the data
        var children = dataHelper.data(data()).deleteTransactionByIds(childTranIds);
        for (var k = 0; k < children.length; k++) {
            children[k].status = 'consolidated';
        }
        var items = dataHelper.data().getItemsFromTransactions(children);
        if (commons.ensure(isGroupSameItemsChecked)) {
            items = dataHelper.data().groupSameItems(items);
        }
        var newSumTran = {
            rawtraninternalid: summaryTranInternalId,
            internalid: '', // To be generated by NS
            docno: '',
            docdate: getHeaderSublistValue(childTranLineNos[0], "custpage_doc_date"),
            type: '', // NA
            transType: '', // NA

            cusname: getHeaderSublistValue(childTranLineNos[0], "custpage_customer"),
            cusaddrphoneno: children[0].cusaddrphoneno,
            cusbankno: children[0].cusbankno,
            currency: children[0].currency,
            custaxregno: children[0].custaxregno,

            invoiceType: children[0].invoiceType,
            taxpayerType: children[0].taxpayerType,
            splitrule: '', // NA
            inforSheetNumber: children[0].inforSheetNumber,
            VATCode: children[0].VATCode,
            VATNumber: children[0].VATNumber,
            itemnameforsales: isSalesListYesSelected() && saleslist.isSalesListApplicable(items) ? labels.itemnameforsales : '',
            remark: children[0].remark,
            taxexclusiveamt: getHeaderSublistValue(childTranLineNos[0], "custpage_tax_excl_amount"),
            afterdiscountamt: getHeaderSublistValue(childTranLineNos[0], "custpage_amount_after_discount"),
            linequantity: items.length,

            approver: '', // To be generated by GTS
            receiver: '', // To be generated by GTS
            sellerbankno: '', // To be generated by GTS
            selleraddrphoneno: '', // To be generated by GTS

            items: items,
            children: children,

            status: 'consolidated',
            rec_status: 'create',
            view_status: 'expanded'
        };
        data().invoices.push(newSumTran);
        setLocalStorage(JSON.stringify(data()));

        renderHelper.renderCheckboxes(form());
        renderGroupSameItems(isGroupSameItemsChecked);
        serverWidgetHelper.form(form()).setFocus('custpage_header_sublist', childTranLineNos[0] + childTranLineNos.length);
    }

    function unmerge() {
        try {
            doUnmerge();
        } catch (ex) {
            handleError(ex);
        }
    }

    function doUnmerge() {
        collectSelectedLines();
        validator().validate(editValidator.Rule.noSummaryTransToUnmerge);

        var childTranLineNos = [];
        for (var i = 0; i < selectedLines.length; i++) {
            var summaryTranInternalId = id({line: selectedLines[i]});
            var summaryTransaction = dataHelper.data(data()).getTransactionByIdentity(summaryTranInternalId);
            for (var j = 1; j <= summaryTransaction.children.length; j++) {
                childTranLineNos.push(selectedLines[i] + j);
            }

            // update the data
            summaryTransaction.rec_status = 'delete';
            summaryTransaction.view_status = '';
            summaryTransaction.status = '';
            for (var k = 0; k < summaryTransaction.children.length; k++) {
                summaryTransaction.children[k].status = '';
            }
            dataHelper.data(data()).addTransactions(summaryTransaction.children);

        }
        setLocalStorage(JSON.stringify(data()));
        unmergeSublist({
            sublistId: 'custpage_header_sublist',
            fieldId: 'custpage_status',
            childTranLineNumbers: childTranLineNos,
            summaryTranLineNumbers: commons.clone(selectedLines)
        });
        serverWidgetHelper.form(form()).setFocus('custpage_header_sublist', 0);
        renderHelper.renderCheckboxes(form());
    }

    function unmergeSublist(params) {
        for (var i = 0; i < params.childTranLineNumbers.length; i++) {
            form().selectLine({
                sublistId: params.sublistId,
                line: params.childTranLineNumbers[i]
            });
            insertHeaderFieldValue(params.fieldId, null);
            form().commitLine({
                sublistId: params.sublistId
            });
        }
        for (var j = 0; j < params.summaryTranLineNumbers.length; j++) {
            form().removeLine({
                sublistId: params.sublistId,
                line: params.summaryTranLineNumbers[j] - j
            });
        }
    }

    function insertSummaryLine(childTransLineNumbers) {
        var customer = getHeaderSublistValue(childTransLineNumbers[0], 'custpage_customer');
        var totalTaxExclAmount = 0.0, totalAmountAfterDiscount = 0.0;
        for (var i = 0; i < childTransLineNumbers.length; i++) {
            var childTranLineNumber = childTransLineNumbers[0] + i;
            var taxExclAmount = getHeaderSublistValue(childTranLineNumber, 'custpage_tax_excl_amount');
            totalTaxExclAmount += commons.ensure(taxExclAmount) ? commons.toNumber(taxExclAmount) : 0.0;
            var amountAfterDiscount = getHeaderSublistValue(childTranLineNumber, 'custpage_amount_after_discount');
            totalAmountAfterDiscount += commons.ensure(amountAfterDiscount) ? commons.toNumber(amountAfterDiscount) : 0.0;
        }
        var summaryTranInternalId = seqDao.nextSequenceNumber();
        form().insertLine({
            sublistId: 'custpage_header_sublist',
            line: childTransLineNumbers[0]
        });
        insertHeaderFieldValue('custpage_status', labels.consolidated);
        insertHeaderFieldValue('custpage_internalid', summaryTranInternalId);
        insertHeaderFieldValue('custpage_doc_date', format.format({
            value: new Date(),
            pattern: 'yyyyMMdd'
        }));
        insertHeaderFieldValue('custpage_customer', customer);
        insertHeaderFieldValue('custpage_tax_excl_amount', format.round(totalTaxExclAmount));
        insertHeaderFieldValue('custpage_amount_after_discount', format.round(totalAmountAfterDiscount));

        form().commitLine({
            sublistId: 'custpage_header_sublist'
        });
        return summaryTranInternalId;
    }

    function validator() {
        return editValidator.data({
            data: data(),
            form: form(),
            selectedLines: selectedLines,
            filter: JSON.parse(filters()),
            isGroupSameItems: renderHelper.isElementChecked('custpage_groupsameitems')
        });
    }

    function insertHeaderFieldValue(fieldId, fieldValue) {
        form().setCurrentSublistValue({
            sublistId: 'custpage_header_sublist',
            fieldId: fieldId,
            value: fieldValue
        });
    }

    function insertItemFieldValue(fieldId, fieldValue) {
        form().setCurrentSublistValue({
            sublistId: 'custpage_item_sublist',
            fieldId: fieldId,
            value: fieldValue
        });
    }

    function reRenderTable(sublistId) {

        var thatData = JSON.parse(getLocalStorage());
        if (!commons.ensure(thatData) || (commons.ensure(sublistId) && sublistId === 'custpage_item_sublist')) {
            return;
        }
        renderHelper.rewindLines(form().getLineCount({
            sublistId: 'custpage_header_sublist'
        }));

        var currentLineId = id();
        var lnNos = lineNos();
        var indentedLines = [], collapsedLines = [], expandedLines = [], hiddenLines = [];
        for (var index in thatData.invoices) {
            var summaryTransaction = thatData.invoices[index];
            if (summaryTransaction.status !== 'consolidated' || summaryTransaction.rec_status === 'delete') {
                continue;
            }
            var summaryLineId = id({transaction: summaryTransaction});
            if (commons.ensure(currentLineId) && (summaryLineId === currentLineId)) {
                if (summaryTransaction.view_status === 'expanded') {
                    summaryTransaction.view_status = 'collapsed';
                } else { // view_status === 'collapsed'
                    summaryTransaction.view_status = 'expanded';
                }
            }
            if (summaryTransaction.view_status === 'expanded') {
                expandedLines.push(lnNos[summaryLineId]);
                for (var child = 1; child <= summaryTransaction.children.length; child++) {
                    indentedLines.push(lnNos[summaryLineId] + child);
                }
            } else { // view_status === 'collapsed'
                collapsedLines.push(lnNos[summaryLineId]);
                for (var child = 1; child <= summaryTransaction.children.length; child++) {
                    hiddenLines.push(lnNos[summaryLineId] + child);
                }
            }
        }
        setLocalStorage(JSON.stringify(thatData));

        renderHelper.renderCheckboxes(form(), selectedLines);
        renderHelper.reRenderLines({
            indentedLines: indentedLines,
            hiddenLines: hiddenLines,
            collapsedLines: collapsedLines,
            expandedLines: expandedLines
        });
    }

    function collectSelectedLines() {
        selectedLines = [];
        var lineCount = form().getLineCount({
            sublistId: 'custpage_header_sublist'
        });
        for (var i = 0; i < lineCount; i++) {
            if (renderHelper.isLineSelected(i)) {
                selectedLines.push(i);
            }
        }
    }

    function lineNos() {
        var values = [];
        var lineCount = form().getLineCount({
            sublistId: 'custpage_header_sublist'
        });
        for (var i = 0; i < lineCount; i++) {
            values[id({line: i})] = i;
        }
        return values;
    }

    /**
     * The transaction internal id is unique and identified while
     * document number is not unique cross various types of transactions.
     *
     * So internal id if exist should be used first to identify a transaction.
     * The exception is consolidated transaction in memory, it doesn't have
     * the internal id, so we have to use document number to identify it.
     *
     * Thru certain mechanism, we can make sure document number of consolidated
     * transaction is unique.
     *
     * The consolidated transaction get internal id once being saved.
     *
     */
    function id(params) {
        if (!commons.makesure(params)) {
            params = {};
        }
        params.form = form();
        return dataHelper.id(params);
    }

    function handleError(ex) {
        if (ex.name === error.UserError) {
            alertDialog({
                title: message.Error,
                message: ex.message
            });
        } else {
            util.writeDocument(ex.message || ex);
        }
    }

    function alertDialog(params) {
        require.requireModule([
            'N/ui/dialog'
        ], function(dialog) {
            var buttonOk = {
                label: buttons.ConfirmButton,
                value: true
            };
            dialog.create({
                title: params.title,
                message: params.message,
                buttons: [
                    buttonOk
                ]
            });
        });
    }

    function pageInit(scriptContext) {
        NS.jQuery(document).ready(function() {
            var editRowDiv = Machine.prototype.editRow;
            var renderTable = Machine.prototype.renderTable;
            Machine.prototype.editRow = function() {
                editRowDiv.apply(this, arguments);
                renderHelper.hideButtonRowAndAddRow();
                reRenderTable(this.name);
            };

            Machine.prototype.renderTable = function() {
                renderTable.apply(this, arguments);
                renderHelper.reRenderTableHeader();
            }

            Machine.prototype.transferInputFieldValuesToDisplayOnly = function() {
            }

            renderGroupSameItems();
            renderHelper.hideButtonRowAndAddRow();
            renderHelper.reRenderTableHeader();
            renderHelper.renderCheckboxes(form(), selectedLines);
        });

        setLocalStorage(JSON.stringify(data()));
        reRenderTable();
    }

    function lineInit(context) {
        renderGroupSameItems();
        collectSelectedLines();
        refreshItems(context);
    }

    function cancel() {
        try {
            return doCancel();
        } catch (ex) {
            handleError(ex);
        }
    }

    function doCancel() {
        require.requireModule([
            'N/ui/dialog'
        ], function(dialog) {
            var buttonOk = {
                label: buttons.ConfirmButton,
                value: true
            };
            var buttonCancel = {
                label: buttons.CancelButton,
                value: false
            };
            dialog.create({
                title: message.Warning,
                message: message.CancelMessage,
                buttons: [
                    buttonOk,
                    buttonCancel
                ]
            }).then(function(result) {
                if (commons.ensure(result)) {
                    var filter = JSON.parse(filters());
                    dontNeedToTakeAdditionalCareJustPatchAsWeDontWantToChangeOldCode(filter);

                    setWindowChanged(window, false);
                    window.location = url.resolveScript({
                        scriptId: 'customscript_sl_cn_vat',
                        deploymentId: 'customdeploy_sl_cn_vat',
                        params: filter
                    });
                }
            });
        });
        return false;
    }

    function dontNeedToTakeAdditionalCareJustPatchAsWeDontWantToChangeOldCode(filter) {
        if (commons.makesure(filter.orginalTransTypes)) {
            filter.orginalTransTypes = filter.orginalTransTypes.join(',');
        }
        if (commons.makesure(filter.transTypes)) {
            filter.transTypes = filter.transTypes.join(',');
        }
        if (commons.makesure(filter.orginalCustomerIds)) {
            filter.orginalCustomerIds = filter.orginalCustomerIds.join(',');
        }
        if (commons.makesure(filter.customerIds)) {
            filter.customerIds = filter.customerIds.join(',');
        }
        return filter;
    }

    function data() {
        if (!commons.makesure(theData)) {
            theData = JSON.parse(https.get(prepareRequestUrl({
                params: filters()
            })).body);
        }
        return theData;
    }

    function setLocalStorage(theValue) {
        form().setValue({
            fieldId: 'custpage_localstorage',
            value: theValue,
            ignoreFieldChange: true,
            fireSlavingSync: true
        });
    }

    function getLocalStorage() {
        return form().getValue('custpage_localstorage');
    }

    function changes() {
        var theChanges = [];
        for (var i = 0; i < data().invoices.length; i++) {
            var tran = data().invoices[i];
            if (isChanged(tran)) {
                theChanges.push(tran);
            }
        }
        return theChanges;
    }

    function renderGroupSameItems(isChecked) {
        renderHelper.renderButtonToCheckbox('custpage_groupsameitems', labels.groupsameitems, isChecked);
    }

    function isChanged(tran) {
        if (!commons.makesure(tran)) {
            return false;
        }
        return tran.rec_status === 'create' || tran.rec_status === 'delete' && commons.makesure(tran.internalid);
    }

    function prepareRequestUrl(params) {
        return url.resolveScript({
            scriptId: 'customscript_rl_cn_vat_get_data',
            deploymentId: 'customdeploy_rl_cn_vat_get_data',
            params: params
        });
    }

    function filters() {
        return form().getValue('custpage_userdata');
    }

    function form() {
        return require.requireModule('N/currentRecord').get();
    }

    function refreshItems(context) {
        // bypass items sublist
        if (context.sublistId === 'custpage_item_sublist') {
            return;
        }
        clearItems();
        if (dataHelper.data(data()).isSalesListEffective(id())) {
            addItemWithSalesList();
        } else {
            addItems();
        }
    }

    function clearItems() {
        serverWidgetHelper.form(form()).clearSublist('custpage_item_sublist');
    }

    function getHeaderSublistValue(line, fieldId) {
        return form().getSublistValue({
            sublistId: 'custpage_header_sublist',
            fieldId: fieldId,
            line: line
        });
    }

    function isSalesListYesSelected() {
        return JSON.parse(filters()).salesList === '0';
    }

    function addItemWithSalesList() {
        var itemForsales = dataHelper.data(data()).getItemFieldValuesForSalesByIdentity(id());
        form().selectNewLine({
            sublistId: 'custpage_item_sublist'
        });
        insertItemFieldValue('custpage_item_name', itemForsales.itemnameforsales);
        insertItemFieldValue('custpage_item_tax_exclusive_amount', itemForsales.totalTaxExclusiveAmount);
        insertItemFieldValue('custpage_item_discount_amount', itemForsales.totalDiscountAmount);
        form().commitLine({
            sublistId: 'custpage_item_sublist'
        });
    }

    function addItems() {
        var items = dataHelper.data(data()).getItemsByIdentity(id());
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            form().selectNewLine({
                sublistId: 'custpage_item_sublist'
            });
            insertItemFieldValue('custpage_item_name', item.name);
            insertItemFieldValue('custpage_item_uom', item.uom);
            insertItemFieldValue('custpage_item_model', item.model);
            insertItemFieldValue('custpage_item_quantity', item.quantity);
            insertItemFieldValue('custpage_unit_pirce', item.unitprice);
            insertItemFieldValue('custpage_item_tax_exclusive_amount', item.taxexclusiveamt);
            insertItemFieldValue('custpage_item_tax_rate', item.taxrate);
            insertItemFieldValue('custpage_item_discount_amount', item.discountamt);
            form().commitLine({
                sublistId: 'custpage_item_sublist'
            });
        }
    }

    function save() {
        try {
            doSave();
        } catch (ex) {
            handleError(ex);
        }
    }

    function doSave() {
        var filter = JSON.parse(filters());
        dontNeedToTakeAdditionalCareJustPatchAsWeDontWantToChangeOldCode(filter);
        https.post({
            url: urlToEditPage(filter),
            body: JSON.stringify(changes()),
        });
        setWindowChanged(window, false);
        window.location = urlToPreviewPage(filter);
    }


    function urlToEditPage(params) {
        return url.resolveScript({
            scriptId: 'customscript_sl_cn_vat_edit',
            deploymentId: 'customdeploy_sl_cn_vat_edit',
            params: params
        });
    }

    function urlToPreviewPage(params) {
        return url.resolveScript({
            scriptId: 'customscript_sl_cn_vat',
            deploymentId: 'customdeploy_sl_cn_vat',
            params: params
        });
    }

    return {
        pageInit: pageInit,
        lineInit: lineInit,
        cancel: cancel,
        merge: merge,
        unmerge: unmerge,
        save: save
    };
});
