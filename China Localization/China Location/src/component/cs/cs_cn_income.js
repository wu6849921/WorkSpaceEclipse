/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define([
    '../../dao/cn_savedreports_dao',
    '../../lib/wrapper/ns_wrapper_url',
    '../../lib/commons',
    '../../constant/constant_cn_income',
    '../../res/income/incomeresource-client',
    '../../lib/wrapper/ns_wrapper_error',
    'N/https',
    '../../err/err_cn_income',
    '../../res/common/commonresource-client',
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../dao/cn_accounting_period_dao',
    '../../dao/cn_subsidiary_dao',
    '../../lib/wrapper/ns_wrapper_record',
    '../../lib/util',
    '../../lib/wrapper/ns_wrapper_require',
    '../../dao/cn_location_dao',
    '../../dao/cn_department_dao',
    '../../dao/cn_class_dao'
],

function(reportdao, url, commons, constants, resource, error, https, incomeError, commonResource, runtime, periodDAO, subsidiaryDAO, record, util, require, locationDAO, departmentDAO, classDAO) {

    var currentFiscalCalendar = -1;
    var loadingMessage;
    var message = resource.load(resource.Name.Errors);
    var informations = resource.load(resource.Name.Informations);
    var filters;

    function loading() {
        if (!commons.makesure(loadingMessage)) {
            var uiMessage = require.requireModule('N/ui/message');
            loadingMessage = uiMessage.create({
                title: informations.Loading,
                type: uiMessage.Type.CONFIRMATION
            });
        }
        return loadingMessage;
    }

    function form(aform) {
        if (!commons.makesure(aform)) {
            var currentRecord = require.requireModule('N/currentRecord');
            aform = currentRecord.get();
        }
        return aform;
    }

    function pageInit(context) {
        if (!runtime.isFeatureInEffect('advancedprinting')) {
            alertDialog({
                title: message.Error,
                message: message.EnableAdvancedPrint
            });
            var refreshButton = form().getField('custpage_refresh');
            refreshButton.isDisabled = true;
        }
    }

    function alertDialog(params) {
        require.requireModule([
            'N/ui/dialog'
        ], function(dialog) {
            dialog.alert(params);
        });
    }

    function refreshIncomeForm() {
        try {
            var filter = getFilter(form(arguments[0]), true);
            disableButtons();
            showLoadingMessage();
            runReport(filter);
        } catch (ex) {
            handleException(ex);
        }
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
            scriptId: 'customscript_rl_cn_run_income_report',
            deploymentId: 'customdeploy_rl_cn_run_income_report',
            params: {
                report: JSON.stringify({
                    id: filter.report.id,
                    name: filter.report.name
                }),
                params: JSON.stringify({
                    period: filter.period.id,
                    subsidiary: filter.subsidiary.id,
                    location: filter.location.id,
                    department: filter.department.id,
                    clasz: filter.clasz.id
                })
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
        if (name === incomeError.RUN_REPORT_ERROR || name === incomeError.REPORT_COLUMN_UNEXPECTED) {
            if (name === incomeError.REPORT_COLUMN_UNEXPECTED) {
                msg = message.ReportColumnsUnExpected;
            }
            name = error.UserError;
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
            scriptId: 'customscript_sl_cn_income',
            deploymentId: 'customdeploy_sl_cn_income',
            params: params
        });
    }

    function getFilter(form, isRefresh, skipNullCheck) {
        if (commons.ensure(isRefresh) || !commons.ensure(filters)) {
            filters = {
                reportNameId: form.getValue('custpage_reportname'),
                report: {
                    id: getReportId(form.getText('custpage_reportname'),skipNullCheck),
                    name: form.getText('custpage_reportname')
                },
                subsidiary: {
                    id: form.getValue('custpage_subsidiary'),
                    name: form.getText('custpage_subsidiary')
                },
                period: {
                    id: validatePeriod(form.getValue('custpage_period')),
                    name: form.getText('custpage_period')
                },
                unit: {
                    id: form.getValue('custpage_unit'),
                    name: form.getText('custpage_unit')
                },
                location: {
                    id: form.getValue('custpage_location') || '',
                    name: form.getText('custpage_location') || '',
                },
                department: {
                    id: form.getValue('custpage_department') || '',
                    name: form.getText('custpage_department') || ''
                },
                clasz: {
                    id: form.getValue('custpage_class') || '',
                    name: form.getText('custpage_class') || ''
                }
            };
        }
        return filters;
    }

    function validatePeriod(period) {
        if (!commons.makesure(period)) {
            throw error.create({
                name: error.UserError,
                message: message.NullPeriod
            });
        }
        return period;
    }

    function getReportId(reportName, skipNullCheck) {
        if (!commons.makesure(reportName)) {
            if (skipNullCheck) {
                return;
            }
            throw error.create({
                name: error.UserError,
                message: message.NullReportName
            });
        }
        try {
            var reportId = reportdao.getReportId(reportName);
        } catch (e) {
            if (e.name === 'NARROW_KEYWORD_SEARCH') {
                throw error.create({
                    name: error.UserError,
                    message: message.InvalidReportName
                });
            } else {
                throw e;
            }
        }
        if (!commons.makesure(reportId)) {
            throw error.create({
                name: error.UserError,
                message: message.InvalidReportName
            });
        }

        return reportId;
    }

    function fieldChanged(context) {
        var currentRecord = context.currentRecord;
        var fieldId = context.fieldId;
        if (fieldId === ('custpage_subsidiary') && runtime.isMultipleCalendars()) {
            subsidiaryChanged(currentRecord);
        }
    }

    function subsidiaryChanged(currentRecord) {
        var periodField = currentRecord.getField({
            fieldId: 'custpage_period'
        });

        var subsidiaryId = currentRecord.getValue({
            fieldId: 'custpage_subsidiary'
        });

        if (!isSameFiscalcalendar(subsidiaryId)) {
            var periods = getPeriods(subsidiaryId);

            if (commons.makesure(periods)) {
                removeAllSelectOption(periodField);
                for (var i = 0; i < periods.length; i++) {
                    periodField.insertSelectOption({
                        text: periods[i].text,
                        value: periods[i].value
                    });
                }
            } else {
                removeAllSelectOption(periodField);
                alertDialog({
                    title: message.Error,
                    message: message.NullPeriod
                });

            }

            currentRecord.setValue({
                fieldId: 'custpage_period',
                value: latestPeriod(subsidiaryId),
                ignoreFieldChange: true,
                fireSlavingSync: true
            });
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
                    value: -1
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
                    value: -1
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
                    value: -1
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

    function isSameFiscalcalendar(subsidiaryId) {
        return currentFiscalCalendar === getFiscalcalendar(subsidiaryId);
    }

    function getPeriods(subsidiaryId) {
        var fiscalcalendarAfterChanged = getFiscalcalendar(subsidiaryId);
        currentFiscalCalendar = fiscalcalendarAfterChanged;
        return periodDAO.fetchPeriodsAsDropDown({
            fiscalcalendar: fiscalcalendarAfterChanged
        });

    }

    function getFiscalcalendar(subsidiaryId) {
        return subsidiaryDAO.getFiscalCalendar(subsidiaryId);
    }

    function removeAllSelectOption(field) {
        field.removeSelectOption({
            value: null
        });
    }

    function latestPeriod(subsidiaryId) {
        return periodDAO.fetchLatestPeriod({
            fiscalcalendar: getFiscalcalendar(subsidiaryId)
        });
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

    /**
     * Report Data after refresh will be saved in custom record customrecord_cn_income_report_data, in order to retrieve the data from server's side
     * This function will check whether the record is existed in case user or system deleted it by mistake or in purpose
     *
     */
    function checkCachedReportData() {
        try {
            var reportDataId = document.getElementById('custpage_reportdataid').value;
            record.load({
                type: 'customrecord_cn_income_report_data',
                id: reportDataId
            });
        } catch (ex) {
            throw error.create({
                name: error.UserError,
                message: message.RefreshPageRequest
            });
        }
    }

    function exportFile(format) {
        var filter = getFilter(form());
        var reportDataId = document.getElementById('custpage_reportdataid').value;

        util.popupFileDownloadDialog(suiteletUrl({
            filter: JSON.stringify(filter),
            reportDataId: reportDataId,
            format: format
        }));
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
    

    return {
        refreshIncomeForm: refreshIncomeForm,
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        exportExcel: exportExcel,
        exportPDF: exportPDF
    };

});
