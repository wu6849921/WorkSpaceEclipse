/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/wrapper/ns_wrapper_currentRecord',
    '../../lib/wrapper/ns_wrapper_dialog',
    '../../app/balance_sheet/app_cn_blsheet_cs_adapter',
    'N/ui/message',
    'N/https'

], function(currentRecord, dialog, cs_adapter, message, https) {
    /**
     * @desc refresh balance sheet filter form.
     */
    function refreshBLsheetFilterForm() {
        cs_adapter.refreshBLsheetFilterForm(currentRecord, dialog.alert, message, https.post, https.get.promise, https.get);
    }
    /**
     * Function to be executed after page is initialized.
     * 
     * @param {Object}
     *            scriptContext
     * @param {Record}
     *            scriptContext.currentRecord - Current form record
     * @param {string}
     *            scriptContext.mode - The mode in which the record is being
     *            accessed (create, copy, or edit)
     * 
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        var currentRecord = scriptContext.currentRecord;
        cs_adapter.pageInit(currentRecord, dialog.alert);

    }
    /**
     * Function to be executed when field is changed.
     * 
     * @param {Object}
     *            scriptContext
     * @param {Record}
     *            scriptContext.currentRecord - Current form record
     * @param {string}
     *            scriptContext.sublistId - Sublist name
     * @param {string}
     *            scriptContext.fieldId - Field name
     * @param {number}
     *            scriptContext.lineNum - Line number. Will be undefined if not
     *            a sublist or matrix field
     * @param {number}
     *            scriptContext.columnNum - Line number. Will be undefined if
     *            not a matrix field
     * 
     * @since 2015.2
     */
    function fieldChanged(context) {
        var currentRecord = context.currentRecord;
        var fieldId = context.fieldId;
        cs_adapter.fieldChanged(currentRecord, fieldId, dialog.alert);
    }
    /**
     * @desc export file as excel format.
     */
    function exportExcel() {
        cs_adapter.exportExcel(currentRecord);
    }
    /**
     * @desc export file as pdf format.
     */
    function exportPDF() {
        cs_adapter.exportPDF(currentRecord, dialog.alert, https.post);
    }

    return {
        exportExcel: exportExcel,
        exportPDF: exportPDF,
        refreshBLsheetFilterForm: refreshBLsheetFilterForm,
        pageInit: pageInit,
        fieldChanged: fieldChanged

    };

});
