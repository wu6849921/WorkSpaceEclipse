/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define([
    './app_cn_vat_render_helper',
    '../../res/cbjl/cbjlresource-client',
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../dao/cn_subsidiary_dao',
    '../../lib/commons',
    '../../lib/axe',
    '../../dao/cn_extended_report_dao',
    '../../err/err_cn_cbjl',
    '../../constant/constant_cn_cbjl',
    '../../lib/wrapper/ns_wrapper_dialog',
    '../../lib/wrapper/ns_wrapper_error',
    '../../lib/wrapper/ns_wrapper_require',
    '../../lib/wrapper/ns_wrapper_format',
    '../../lib/wrapper/ns_wrapper_url',
    'N/https',
    '../../res/common/commonresource-client',
    '../../lib/wrapper/ns_wrapper_record',
    '../../lib/util',
    '../../dao/cn_location_dao',
    '../../dao/cn_department_dao',
    '../../dao/cn_class_dao'
    ],
function (renderHelper, resource, runtime, subsidiaryDAO, commons, axe, extDao, cbjlError, constants, dialog, error, require, formatter, url, https, commonResource, record, util, locationDAO, departmentDAO, classDAO) {
    var columnName = resource.load(resource.Name.Header);
    var message = resource.load(resource.Name.Errors);
    var info = resource.load(resource.Name.Informations);
    var originalAccountFrom;
    var originalAccountTo;
    var theFilters;
    var loadingMessage;

    function pageInit(context){
        var accountFromValue = form().getValue('custpage_accountfrom');
        var accountToValue = form().getValue('custpage_accountto');
        if (!runtime.isFeatureInEffect('advancedprinting')) {
            alertDialog({
                title: message.Error,
                message: message.EnableAdvancedPrint
            });
            var refreshButton = form().getField('custpage_refresh');
            refreshButton.isDisabled = true;
        }
        theFilters = filters(form(), true);
        var reportSublist = form().getSublist({
            sublistId: 'custpage_report_sublist'
        });
        if (commons.ensure(reportSublist)) {
            NS.jQuery(document).ready(function () {
                var renderTable = Machine.prototype.renderTable;
                Machine.prototype.renderTable = function () {
                    renderTable.apply(this, arguments);
                    reRenderTableHeader();
                };
            });
            reRenderTableHeader();
            axe.hide({id: 'tbl_secondarycustpage_refresh'});
            axe.hide({id: 'tbl_secondarycustpage_export_excel'});
            axe.hide({id: 'tbl_secondarycustpage_export_pdf'});
        }
        setAccountValue(accountFromValue, accountToValue);

    }

    function setAccountValue(accountFromValue, accountToValue) {
        originalAccountFrom = accountFromValue;
        originalAccountTo = accountToValue;
    }

    function form(aform) {
        if (!commons.makesure(aform)) {
            var currentRecord = require.requireModule('N/currentRecord');
            aform = currentRecord.get();
        }
        return aform;
    }

    function reRenderTableHeader() {
        var header =
            "<th class='listheadertd listheadertextb uir-column-large' rowspan='2' style='vertical-align: middle;'><div align='center' class='listheader'>" + columnName.Account + "</div></th>" +
            "<th class='listheadertd listheadertextb uir-column-large' rowspan='2' style='vertical-align: middle;'><div align='center' class='listheader'>" + columnName.Date + "</div></th>" +
            "<th class='listheadertd listheadertextb uir-column-large' rowspan='2' style='vertical-align: middle;'><div align='center' class='listheader'>" + columnName.Type + "</div></th>" +
            "<th class='listheadertd listheadertextb uir-column-large' rowspan='2' style='vertical-align: middle;'><div align='center' class='listheader'>" + columnName.Memo + "</div></th>" +
            "<th class='listheadertd listheadertextb uir-column-large' rowspan='2' style='vertical-align: middle;'><div align='center' class='listheader'>" + columnName.DocumentNumber + "</div></th>" +
            "<th class='listheadertd listheadertextb uir-column-large' rowspan='2' style='vertical-align: middle;'><div align='center' class='listheader'>" + columnName.PaymentMethod + "</div></th>" +
            "<th class='listheadertd listheadertextb uir-column-large' rowspan='2' style='vertical-align: middle;'><div align='center' class='listheader'>" + columnName.GLNumber + "</div></th>" +
            "<th class='listheadertd listheadertextb uir-column-large' rowspan='2' style='vertical-align: middle;'><div align='center' class='listheader'>" + columnName.DebitAmount + "</div></th>" +
            "<th class='listheadertd listheadertextb uir-column-large' rowspan='2' style='vertical-align: middle;'><div align='center' class='listheader'>" + columnName.CreditAmount + "</div></th>"+
            "<th class='listheadertd listheadertextb uir-column-large' colspan='2'><div align='center' class='listheader'>" + columnName.Balance + "</div></th>";
        var newRow =
            "<tr class='uir-machine-headerrow'>" +
            "<th class='listheadertd listheadertextb uir-column-large' width ='5%'><div align='center' class='listheader'>" + columnName.BalanceDirection + "</div></th>" +
            "<th class='listheadertd listheadertextb uir-column-large'><div align='center' class='listheader'>" + columnName.BalanceAmount + "</div></th>" +
            "</tr>";
        var row = NS.jQuery('#custpage_report_sublistheader');
        row.html(header);
        row.after(newRow);
    }

    function alertDialog(params) {
        require.requireModule([
            'N/ui/dialog'
        ], function (dialog) {
            dialog.alert(params);
        });
    }

    function fieldChanged(context){
        var currentRecord = context.currentRecord;
        var fieldId = context.fieldId;
        if(fieldId === ('custpage_subsidiary')){
            subsidiaryChanged(currentRecord);
        }else if (fieldId === 'custpage_accountto') {
            accountToChanged(currentRecord);
        } else if (fieldId === 'custpage_accountfrom') {
            accountFromChanged(currentRecord);
        }
    }

    function accountToChanged(currentRecord){
        var accountFromText = currentRecord.getText('custpage_accountfrom');
        var accountToText = currentRecord.getText('custpage_accountto');
        if (commons.makesure(accountFromText) && commons.makesure(accountToText)) {
            if (accountFromText > accountToText) {
                dialog.alert({
                    title: error.Message.Alert,
                    message: message.InvalidAccount
                }).then(currentRecord.setValue({
                    fieldId: 'custpage_accountto',
                    value: originalAccountTo,
                    ignoreFieldChange: true,
                    fireSlavingSync: true
                }));
            }
        }
        originalAccountTo = currentRecord.getValue('custpage_accountto');
    }

    function accountFromChanged(currentRecord){
        var accountFromText = currentRecord.getText('custpage_accountfrom');
        var accountToText = currentRecord.getText('custpage_accountto');
        if (commons.makesure(accountFromText) && commons.makesure(accountToText)) {
            if (accountFromText > accountToText) {
                dialog.alert({
                    title: error.Message.Alert,
                    message: message.InvalidAccount
                }).then(currentRecord.setValue({
                    fieldId: 'custpage_accountfrom',
                    value: originalAccountFrom,
                    ignoreFieldChange: true,
                    fireSlavingSync: true
                }));
            }
        }
        originalAccountFrom = currentRecord.getValue('custpage_accountfrom');

    }

    function subsidiaryChanged(currentRecord) {

        var accountFromField = currentRecord.getField({
            fieldId: 'custpage_accountfrom'
        });

        var accountToField = currentRecord.getField({
            fieldId: 'custpage_accountto'
        });

        var subsidiaryId = currentRecord.getValue({
            fieldId: 'custpage_subsidiary'
        });

        var accounts = getAccounts(subsidiaryId);
        if (commons.makesure(accounts)) {
            removeAllSelectOption(accountFromField);
            removeAllSelectOption(accountToField);
            for (var i = 0; i < accounts.length; i++) {
                accountFromField.insertSelectOption({
                    text: accounts[i].text,
                    value: accounts[i].value
                });
                accountToField.insertSelectOption({
                    text: accounts[i].text,
                    value: accounts[i].value
                });
            }
        } else {
            removeAllSelectOption(accountFromField);
            removeAllSelectOption(accountToField);
        }

        updateLocationField(currentRecord, subsidiaryId);
        updateDepartmentField(currentRecord, subsidiaryId);
        updateClassField(currentRecord, subsidiaryId);

    }

    function updateLocationField(currentRecord, subsidiaryId){
        var locationField = currentRecord.getField({
            fieldId: 'custpage_location'
        });
        if (commons.makesure(locationField)) {
            var locations = getLocations(subsidiaryId);
            if (commons.makesure(locations)) {
                removeAllSelectOption(locationField);
                locationField.insertSelectOption({
                    text: '&nbsp;',
                    value: ' '
                });
                for (var i = 0; i < locations.length; i++) {
                    locationField.insertSelectOption({
                        text: locations[i].text,
                        value: locations[i].value
                    });
                }
            } else {
                removeAllSelectOption(locationField);
            }
        }
    }

    function updateDepartmentField(currentRecord, subsidiaryId){
        var departmentField = currentRecord.getField({
            fieldId: 'custpage_department'
        });
        if (commons.makesure(departmentField)) {
            var departments = getDepartments(subsidiaryId);
            if (commons.makesure(departments)) {
                removeAllSelectOption(departmentField);
                departmentField.insertSelectOption({
                    text: '&nbsp;',
                    value: ' '
                });
                for (var i = 0; i < departments.length; i++) {
                    departmentField.insertSelectOption({
                        text: departments[i].text,
                        value: departments[i].value
                    });
                }
            } else {
                removeAllSelectOption(departmentField);
            }
        }
    }

    function updateClassField(currentRecord, subsidiaryId) {
        var classField = currentRecord.getField({
            fieldId: 'custpage_class'
        });
        if (commons.makesure(classField)) {
            var classes = getClasses(subsidiaryId);
            if (commons.makesure(classes)) {
                removeAllSelectOption(classField);
                classField.insertSelectOption({
                    text: '&nbsp;',
                    value: ' '
                });
                for (var i = 0; i < classes.length; i++) {
                    classField.insertSelectOption({
                        text: classes[i].text,
                        value: classes[i].value
                    });
                }
            } else {
                removeAllSelectOption(classField);
            }
        }
    }

    function removeAllSelectOption(field) {
        field.removeSelectOption({
            value: null
        });
    }

    function getAccounts(subsidiaryId) {
        return extDao.fetchAccountsAsDropDown({
            subsidiary: subsidiaryId,
            type:'Bank'
        });
    }

    function refresh(){
        try {
            verifyDateField();
            var filter = filters(form(arguments[0]), true);
            disableButtons();
            showLoadingMessage();
            runReport(filter);
        } catch (ex) {
            handleException(ex);
        }

    }

    function verifyDateField(){

        var fromDate = form().getValue({
            fieldId: 'custpage_datefrom'
        });
        var toDate = form().getValue({
            fieldId: 'custpage_dateto'
        });

        if(illegalDateParam(fromDate, toDate)){
            throw error.create({name: error.UserError, message: message.InvalidDate});
        }
    }
    
    function illegalDateParam(fromDate, toDate){
        return !(commons.isDate(fromDate) && commons.isDate(toDate)) || (fromDate > toDate);
    }
    
    function exportExcel() {
        doExport(constants.FORMAT_EXCEL);
    }

    function exportPDF() {
        doExport(constants.FORMAT_PDF);
    }

    function doExport(format) {
        try {
            var thisForm = form();
            var filter = filters(thisForm);
            var reportDataId = thisForm.getValue('custpage_reportdataid');
            checkCachedReportData(JSON.parse(reportDataId));
            exportFile(format, reportDataId, filter);
        } catch (ex) {
            if (ex.name === error.UserError || ex.name === error.UnexpectedError) {
                alertDialog({
                    title: message.Error,
                    message: ex.message
                });
            }
        }
    }

    function checkCachedReportData(reportDataId) {
        try {
            record.load({
                type: 'customrecord_cn_gl_report_data',
                id: reportDataId[0]
            });
        } catch (ex) {
            throw error.create({
                name: error.UserError,
                message: message.RefreshPageRequest
            });
        }
    }

    function exportFile(format, reportDataId, filter) {
        util.popupFileDownloadDialog(suiteletUrl({
            filter: JSON.stringify(filter),
            reportDataId: reportDataId,
            format: format
        }));
    }

    function runReport(filter) {
        https.get.promise(prepareRequestUrl(filter)).then(function (reportResp) {
            try {
                var responseBody = handleReportResponse(reportResp);
                doRefresh(responseBody.reportDataId, filter);
            } catch (ex) {
                handleException(ex);
            }
        }).catch(function (e) {
            handleException(createError(e.name, e.message));
        });
    }

    function prepareRequestUrl(filter) {
        return url.resolveScript({
            scriptId: 'customscript_rl_cn_run_gl_report',
            deploymentId: 'customdeploy_rl_cn_run_gl_report',
            params: {
                type: 'cbjl',
                filter: JSON.stringify(filter)
                }
        });
    }

    function handleReportResponse(reportResp) {
        if (!commons.makesure(reportResp) || !commons.makesure(reportResp.code)  && !commons.makesure(reportResp.body)){
            throw createError();
        }

        if (commons.toNumber(reportResp.code) >= 400) {
            var errorCodeMessage = error.parseErrorResponse(reportResp.body);
            throw createError(errorCodeMessage.errorCode, errorCodeMessage.message);
        }

        if(!commons.makesure(reportResp.body)){
            throw createError();
        }
        var responseBody = JSON.parse(reportResp.body);
        if (commons.makesure(responseBody.code)) {  // To judge if the response is error response
            throw createError(responseBody.code, responseBody.details);
        }
        return responseBody;
    }

    function createError(name, msg) {
        if (name === cbjlError.RUN_REPORT_ERROR || name === cbjlError.REPORT_ROWS_EXCEED_THRESHOLD) {
            if (name === cbjlError.REPORT_ROWS_EXCEED_THRESHOLD) {
                var reportDataId = msg.split(':')[1];
                dialog.alert({
                    title: message.Alert,
                    message: message.ReportRowsExceedThreshold
                }).then(function() {
                    doRefresh(JSON.parse(reportDataId), filters(form(), true, true));
                });
                return;
            }
        } else {
            name = error.UnexpectedError;
            msg = commonResource.load(commonResource.Name.Errors).UnexpectedError;
        }
        
        return error.create({
            name: name,
            message: msg
        });
    }

    function doRefresh(reportDataId, filter) {
        var newSuiteletUrl = suiteletUrl({
            filter: JSON.stringify(filter),
            format: constants.FORMAT_PAGE,
            reportDataId: JSON.stringify(reportDataId)
        });
        setWindowChanged(window, false);
        window.location = newSuiteletUrl;
    }

    function suiteletUrl(params) {
        return url.resolveScript({
            scriptId: 'customscript_sl_cn_cbjl',
            deploymentId: 'customdeploy_sl_cn_cbjl',
            params: params
        });
    }

    function filters(form, isRefresh, rowsExceedThreshold) {
        if (commons.ensure(isRefresh) || !commons.ensure(theFilters)) {
            theFilters = {
                subsidiary: {
                    id: form.getValue('custpage_subsidiary'),
                    name: form.getText('custpage_subsidiary')
                },
                date: {
                    from: {
                        id: form.getValue('custpage_datefrom'),
                        name: form.getText('custpage_datefrom')
                    },
                    to: {
                        id: form.getValue('custpage_dateto'),
                        name: form.getText('custpage_dateto')
                    }
                },
                account: {
                    from: {
                        id: form.getValue('custpage_accountfrom').trim(),
                        name: form.getText('custpage_accountfrom').trim()
                    },
                    to: {
                        id: form.getValue('custpage_accountto').trim(),
                        name: form.getText('custpage_accountto').trim()
                    }
                },
                location: {
                    id: form.getValue('custpage_location')? form.getValue('custpage_location').trim() : '',
                    name: form.getText('custpage_location') ? form.getText('custpage_location').trim() : ''
                },
                department: {
                    id: form.getValue('custpage_department')? form.getValue('custpage_department').trim() : '',
                    name: form.getText('custpage_department') ? form.getText('custpage_department').trim() : ''
                },
                clasz: {
                    id: form.getValue('custpage_class')? form.getValue('custpage_class').trim() : '',
                    name: form.getText('custpage_class') ? form.getText('custpage_class').trim() : ''
                },
                accountlevel: 'onlylast',
                rowsExceedThreshold: rowsExceedThreshold
            };
        }
        return theFilters;
    }

    function handleException(ex) {
        if(!commons.makesure(ex)) {
            return;
        }
        hideLoadingMessage();
        enableButtons();
        alertDialog({
            title: message.Error,
            message: ex.message
        });
    }

    function disableButtons() {
        form().getField({
            fieldId: 'custpage_refresh'
        }).isDisabled = true;
        var exportExcelButton = form().getField({
            fieldId: 'custpage_export_excel'
        });
        if (commons.makesure(exportExcelButton)) {
            exportExcelButton.isDisabled = true;
        }
        var exportPdfButton = form().getField({
            fieldId: 'custpage_export_pdf'
        });
        if (commons.makesure(exportPdfButton)) {
            exportPdfButton.isDisabled = true;
        }
    }
    function enableButtons() {
        form().getField({
            fieldId: 'custpage_refresh'
        }).isDisabled = false;
        var exportExcelButton = form().getField({
            fieldId: 'custpage_export_excel'
        });
        if (commons.makesure(exportExcelButton)) {
            exportExcelButton.isDisabled = false;
        }
        var exportPdfButton = form().getField({
            fieldId: 'custpage_export_pdf'
        });
        if (commons.makesure(exportPdfButton)) {
            exportPdfButton.isDisabled = false;
        }
    }
    function showLoadingMessage() {
        if (!commons.makesure(loadingMessage)) {
            var uiMessage = require.requireModule('N/ui/message');
            loadingMessage = uiMessage.create({
                title: info.Loading,
                type: uiMessage.Type.CONFIRMATION
            });
        }
        loadingMessage.show();
    }
    function hideLoadingMessage() {
        if (commons.makesure(loadingMessage)) {
            loadingMessage.hide();
        }
    }

    function getLocations(subsidiaryId) {
        return locationDAO.fetchLocationsAsDropDown({
            subsidiary: subsidiaryId
        });
    }

    function getDepartments(subsidiaryId) {
        return departmentDAO.fetchDepartmentsAsDropDown({
            subsidiary: subsidiaryId
        });
    }

    function getClasses(subsidiaryId) {
        return classDAO.fetchClassesAsDropDown({
            subsidiary: subsidiaryId
        });
    }


    return{
        pageInit: pageInit,
        refresh: refresh,
        fieldChanged: fieldChanged,
        exportExcel: exportExcel,
        exportPDF: exportPDF
    }
})