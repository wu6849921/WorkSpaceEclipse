/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/commons',
    'N/https',
    '../../res/atbl/atblresource-client',
    '../../constant/constant_cn_atbl',
    '../../res/common/commonresource-client',
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../lib/wrapper/ns_wrapper_require',
    '../../dao/cn_subsidiary_dao',
    '../../dao/cn_extended_report_dao',
    '../../lib/wrapper/ns_wrapper_error',
    '../../err/err_cn_atbl',
    './app_cn_vat_render_helper',
    '../../lib/wrapper/ns_wrapper_url',
    '../../lib/wrapper/ns_wrapper_record',
    '../../lib/util',
    '../../lib/axe',
    '../../lib/wrapper/ns_wrapper_dialog',
    '../../dao/cn_location_dao',
    '../../dao/cn_department_dao',
    '../../dao/cn_class_dao'
],

function(commons, https, resource, constants, commonResource, runtime, require, subsidiaryDAO, atblDao, error, atblError, renderHelper, url, record, util, axe, dialog, locationDAO, departmentDAO, classDAO) {

    var loadingMessage;
    var message = resource.load(resource.Name.Errors);
    var info = resource.load(resource.Name.Informations);
    var columnName = resource.load(resource.Name.Header);
    var theFilters;
    var originalAccountFrom;
    var originalAccountTo;

    function pageInit(context) {
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
        setAccountValue(accountFromValue,accountToValue);

        var reportSublist = form().getSublist({
            sublistId: 'custpage_atbl_report_sublist'
        });
        if (commons.ensure(reportSublist)) {
            var reportCount = form().getLineCount({
                sublistId: 'custpage_atbl_report_sublist'
            });
            if (!commons.ensure(reportCount)) {
                var exportExcelButton = form().getField('custpage_export_excel');
                if (commons.makesure(exportExcelButton)) {
                    exportExcelButton.isDisabled = true;
                }
                var exportPdfButton = form().getField('custpage_export_pdf');
                if (commons.makesure(exportPdfButton)) {
                    exportPdfButton.isDisabled = true;
                }
            }
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
    }
    function setAccountValue(accountFromValue,accountToValue){
        originalAccountFrom = accountFromValue;
        originalAccountTo = accountToValue;
    }
    function alertDialog(params) {
        require.requireModule([
            'N/ui/dialog'
        ], function(dialog) {
            dialog.alert(params);
        });
    }
    
    function refresh() {
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
        var format = constants.FORMAT_EXCEL;
        doExport(format);
    }
    function exportPDF() {
        var format = constants.FORMAT_PDF;
        doExport(format);
    }

    function doExport(format) {
        try {
            checkCachedReportData();
            exportFile(format);
        } catch (ex) {
            if (ex.name === error.UserError || ex.name === error.UnexpectedError) {
                alertDialog({
                    title: message.Error,
                    message: ex.message
                });
            }
        }
    }

    function exportFile(format) {
        var filter = filters(form());
        var reportDataId = document.getElementById('custpage_reportdataid').value;

        util.popupFileDownloadDialog(suiteletUrl({
            filter: JSON.stringify(filter),
            reportDataId: reportDataId,
            format: format
        }));
    }
    function checkCachedReportData() {
       try {
            var reportDataId = document.getElementById('custpage_reportdataid').value;
            record.load({
                type: 'customrecord_cn_atbl_report_data',
                id: reportDataId
            });
        } catch (ex) {
            throw error.create({
                name: error.UserError,
                message: message.RefreshPageRequest
            });
        }
    }
    
    function filters(form, isRefresh) {
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
                        id: form.getValue('custpage_accountfrom'),
                        name: form.getText('custpage_accountfrom')
                    },
                    to: {
                        id: form.getValue('custpage_accountto'),
                        name: form.getText('custpage_accountto')
                    }                    
                },
                accountlevel : {
                    id: form.getValue('custpage_accountlevel'),
                    name: form.getText('custpage_accountlevel')
                },
               location: {
                   id: form.getValue('custpage_location') ? form.getValue('custpage_location').trim() : '',
                   name: form.getText('custpage_location') ? form.getText('custpage_location').trim() : ''
               },
               department: {
                   id: form.getValue('custpage_department') ? form.getValue('custpage_department').trim() : '',
                   name: form.getText('custpage_department') ? form.getText('custpage_department').trim() : ''
               },
               clasz: {
                   id: form.getValue('custpage_class') ? form.getValue('custpage_class').trim() : '',
                   name: form.getText('custpage_class') ? form.getText('custpage_class').trim() : ''
               }
            };
        }
        return theFilters;
    }


    function form(aform) {
        if (!commons.makesure(aform)) {
            var currentRecord = require.requireModule('N/currentRecord');
            aform = currentRecord.get();
        }
        return aform;
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

    function hideLoadingMessage() {
        loading().hide();
    }
    
    function showLoadingMessage() {
        loading().show();
    }
    
    function loading() {
        if (!commons.makesure(loadingMessage)) {
            var uiMessage = require.requireModule('N/ui/message');
            loadingMessage = uiMessage.create({
                title: info.Loading,
                type: uiMessage.Type.CONFIRMATION
            });
        }
        return loadingMessage;
    }
    
    function runReport(filter) {
        https.get.promise(prepareRequestUrl(filter)).then(function(reportResp) {
            try {
                var responseObj = handleReportResponse(reportResp);
                doRefresh(responseObj.reportDataId, filter);
            } catch (ex) {
                handleException(ex);
            }
        }).catch(function(e) {
            handleException(createError(e.name, e.message));
        });
    }
    
    function prepareRequestUrl(filter) {
        return url.resolveScript({
            scriptId: 'customscript_rl_cn_run_atbl_report',
            deploymentId: 'customdeploy_rl_cn_run_atbl_report',
            params: {filter: JSON.stringify(filter)}
        });
    }

    function handleReportResponse(reportResp, leftover) {
        if (commons.toNumber(reportResp.code) >= 400) {
            var errorCodeMessage = error.parseErrorResponse(reportResp.body);
            throw createError(errorCodeMessage.errorCode, errorCodeMessage.message);
        }
        var responseBody = JSON.parse(reportResp.body);
        // To judge if the response is error response
        if (commons.makesure(responseBody.code)) {
            throw createError(responseBody.code, responseBody.details, leftover);
        }
        return responseBody;
    }

    function doRefresh(reportDataId, filter) {
        var newSuiteletUrl = suiteletUrl({
            filter: JSON.stringify(filter),
            format: constants.FORMAT_PAGE,
            reportDataId: reportDataId
        });
        setWindowChanged(window, false);
        window.location = newSuiteletUrl;
    }
    
    function suiteletUrl(params) {
        return url.resolveScript({
            scriptId: 'customscript_sl_cn_atbl',
            deploymentId: 'customdeploy_sl_cn_atbl',
            params: params
        });
    }

    function createError(name, msg, leftover) {
        if (name === atblError.RUN_REPORT_ERROR || name === atblError.REPORT_ROWS_EXCEED_THRESHOLD) {
            if (name === atblError.REPORT_ROWS_EXCEED_THRESHOLD) { // Error could be thrown when drill down
                var reportDataId = msg.split(':')[1];
                dialog.alert({
                    title: message.Alert,
                    message: message.ReportRowsExceedThreshold
                }).then(function() {
                    leftover.filter = JSON.parse(leftover.filter);
                    leftover.filter.rowsExceedThreshold = true;
                    leftover.filter = JSON.stringify(leftover.filter);
                    doRedirect(JSON.parse(reportDataId), leftover.filter, leftover.reportType); // Need to redirect for drilldown
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

    function handleException(ex) {
        hideLoadingMessage();
        enableButtons();
        alertDialog({
            title: message.Error,
            message: ex.message
        });
    }

    function reRenderTableHeader() {
        var header =
            "<th class='listheadertd listheadertextb uir-column-large' rowspan='2' style='vertical-align: middle;'><div align='center' class='listheader'>"+columnName.Account+"</div></th>" +
            "<th class='listheadertd listheadertextb uir-column-large' colspan='2'><div align='center' class='listheader'>"+columnName.OpeningBalance+"</div></th>" +
            "<th class='listheadertd listheadertextb uir-column-large' colspan='2'><div align='center' class='listheader'>"+columnName.CurrentPeriod+"</div></th>" +
            "<th class='listheadertd listheadertextb uir-column-large' colspan='2'><div align='center' class='listheader'>"+columnName.ClosingBalance+"</div></th>";
        var newRow =
            "<tr class='uir-machine-headerrow'>" +
            "<th class='listheadertd listheadertextb uir-column-large' width ='5%'><div align='center' class='listheader'>"+columnName.OpenBalanceDirection+"</div></th>" +
            "<th class='listheadertd listheadertextb uir-column-large'><div align='center' class='listheader'>"+columnName.OpenBalanceAmount+"</div></th>" +
            "<th class='listheadertd listheadertextb uir-column-large'><div align='center' class='listheader'>"+columnName.DebitAmount+"</div></th>" +
            "<th class='listheadertd listheadertextb uir-column-large'><div align='center' class='listheader'>"+columnName.CreditAmount+"</div></th>" +
            "<th class='listheadertd listheadertextb uir-column-large' width ='5%'><div align='center' class='listheader'>"+columnName.CloseBalanceDirection+"</div></th>" +
            "<th class='listheadertd listheadertextb uir-column-large'><div align='center' class='listheader'>"+columnName.CloseBalanceAmount+"</div></th>" +
            "</tr>";
        var row = NS.jQuery('#custpage_atbl_report_sublistheader');
        row.html(header);
        row.after(newRow);
    }

    function fieldChanged(context) {
        var currentRecord = context.currentRecord;
        var fieldId = context.fieldId;
        if (fieldId === ('custpage_subsidiary')) {
            subsidiaryChanged(currentRecord);
        }else if(fieldId ==='custpage_accountto'){
            accountToChanged(currentRecord);
        }else if(fieldId ==='custpage_accountfrom'){
            accountFromChanged(currentRecord);
        }
    }

    function accountToChanged(currentRecord){
         var accountFromText = currentRecord.getText('custpage_accountfrom');
         var accountToText = currentRecord.getText('custpage_accountto');
         if(commons.makesure(accountFromText)&&commons.makesure(accountToText)){
             if (accountFromText > accountToText){
                 dialog.alert({
                     title: error.Message.Error,
                     message:message.InvalidAccount
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
        if(commons.makesure(accountFromText)&&commons.makesure(accountToText)){
            if (accountFromText > accountToText){
                dialog.alert({
                    title: error.Message.Error,
                    message:message.InvalidAccount
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
        return atblDao.fetchAccountsAsDropDown({
            subsidiary: subsidiaryId
        });
    }

    onClickAccount =  function(filterEscapeStr, accountType){
        var drilldownFilters = decodeURI(filterEscapeStr);
        var reportType = (accountType === 'Bank') ? 'cbjl' : 'sblg' ;
        runDrilldownReport(drilldownFilters, reportType);
    }

    function runDrilldownReport(filter, reportType) {
        https.get.promise(prepareDrilldownRequestUrl(filter, reportType)).then(function(reportResp) {
            try {
                var responseObj = handleReportResponse(reportResp, {filter: filter, reportType: reportType});
                doRedirect(responseObj.reportDataId, filter, reportType);
            } catch (ex) {
                commons.makesure(ex) && alertDialog({
                    title: message.Error,
                    message: ex.message
                });
            }
        }).catch(function(e) {
            var ex = createError(e.name, e.message);
            alertDialog({
                title: message.Error,
                message: ex.message
            });
        });
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

    function prepareDrilldownRequestUrl(filter, reportType) {
            return url.resolveScript({
                scriptId: 'customscript_rl_cn_run_gl_report',
                deploymentId: 'customdeploy_rl_cn_run_gl_report',
                params: {
                    type: reportType,
                    filter: filter
                    }
            });
    }

    function doRedirect(reportDataId, filter, reportType) {

        var newSuiteletUrl;
        if (reportType === 'sblg') {
            newSuiteletUrl = url.resolveScript({
                scriptId: 'customscript_sl_cn_sblg',
                deploymentId: 'customdeploy_sl_cn_sblg',
                params: {
                    filter: filter,
                    format: constants.FORMAT_PAGE,
                    reportDataId:  JSON.stringify(reportDataId)
                }
            });
        } else {
            newSuiteletUrl = url.resolveScript({
                scriptId: 'customscript_sl_cn_cbjl',
                deploymentId: 'customdeploy_sl_cn_cbjl',
                params: {
                    filter: filter,
                    format: constants.FORMAT_PAGE,
                    reportDataId:  JSON.stringify(reportDataId)
                }
            });
            
        }
        setWindowChanged(window, false);
        window.open(newSuiteletUrl);
    }

    return {
        pageInit: pageInit,
        refresh: refresh,
        fieldChanged: fieldChanged,
        exportExcel: exportExcel,
        exportPDF: exportPDF
    };

});
