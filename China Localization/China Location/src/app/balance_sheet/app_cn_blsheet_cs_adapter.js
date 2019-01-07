/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    '../../lib/wrapper/ns_wrapper_url',
    '../../dao/cn_savedreports_dao',
    '../../app/balance_sheet/app_cn_blsheet_subsidiary_init',
    '../../app/balance_sheet/app_cn_blsheet_period_init',
    '../../lib/commons',
    '../../lib/excelexportutil',
    '../../lib/util',
    '../../app/balance_sheet/app_cn_blsheet_location_init',
    '../../app/balance_sheet/app_cn_blsheet_department_init',
    '../../app/balance_sheet/app_cn_blsheet_class_init',
    '../../lib/wrapper/ns_wrapper_require'
],

function(url, reportdao, subsidiary_init, period_init, commons, exportExcelUtil, util, location_init, department_init, class_init, require) {
    var _dataReady = false;
    var _success = true;
    var _response = {};
    function isDataReady() {
        return _dataReady;
    }
    function isSuccess() {
        return _success;
    }
    function setDataAndRespReady(dataReady, resp) {
        _dataReady = dataReady;
        _response = resp;
    }
    function waitAndExecute(fnToWait, fnToExecute) {
        var timeoutId = null;
        timeoutId = window.setInterval(function() {
            if (fnToWait()) {
                window.clearInterval(timeoutId);
                fnToExecute();
            }
        }, 1000);
    }
    ;

    /**
     * @desc export the file as excel format
     * @params {Record} [currentRecord] - Current form record
     */

    function exportExcel(currentRecord) {
        var record = currentRecord.get();
        var cacheInfor = record.getValue({
            fieldId: 'custpage_cachefield'
        });
        var fileNamePrefix = JSON.parse(cacheInfor).messageInfor.exportFileNamePrefix;
        var fileName = fileNamePrefix + '.xls';
        if (window.navigator.msSaveOrOpenBlob) {
            var blobData = exportExcelUtil.getExportBlob('blsheet_report');
            window.navigator.msSaveOrOpenBlob(blobData, fileName);
        } else {
            var excelUrl = exportExcelUtil.getExportUrl('blsheet_report');
            setWindowChanged(window, false);
            var downloadLink = document.createElement("a");
            downloadLink.href = excelUrl;
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    }

    /**
     * @desc export the file as excel format
     * @params {Record} [currentRecord] - Current form record
     * @params {Function} [alertfn] - the diag.alert function
     * @params {Function} [postfn] - the http.post function
     *
     */
    function exportPDF(currentRecord, alertfn, postfn) {
        var record = currentRecord.get();
        var cacheInfor = record.getValue({
            fieldId: 'custpage_cachefield'
        });
        var fileNamePrefix = JSON.parse(cacheInfor).messageInfor.exportFileNamePrefix;
        var fileName = fileNamePrefix + '.pdf';
        var params = {};
        params.type = 'pdf';
        try {
            var suiteletUrlForPDF = url.resolveScript({
                scriptId: 'customscript_sl_cn_blsheet',
                deploymentId: 'customdeploy_sl_cn_blsheet',
                returnExternalUrl: false,
                params: params
            });
            var httpsResp = postfn({
                url: suiteletUrlForPDF,
                body: document.getElementById('blsheet_header').outerHTML + document.getElementById('blsheet_data').outerHTML
            });
            var blob = exportExcelUtil.b64toBlob(httpsResp.body, 'application/pdf');
            if (window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(blob, fileName);
            } else {
                var pdfUrl = window.URL.createObjectURL(blob);
                setWindowChanged(window, false);
                var downloadLink = document.createElement("a");
                downloadLink.href = pdfUrl;
                downloadLink.download = fileName;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            }
        } catch (ex) {
            alertfn({
                title: JSON.parse(cacheInfor).messageInfor.errorMessage.errorTitle,
                message: JSON.parse(cacheInfor).messageInfor.errorMessage.errorExportPDF
            });
        }
    }


    /**
     * @desc pageInit for cs to adapt
     * @params {Record} [currentRecord] - Current form record
     * @params {Function} [alertfn] - the diag.alert function
     *
     */
    function pageInit(currentRecord, alertfn) {
        var cacheInfor = JSON.parse(currentRecord.getValue({
            fieldId: 'custpage_cachefield'
        }));
        var advancePrintEnable = cacheInfor.advancePrintEnable;
        if (!advancePrintEnable) {
            alertfn({
                title: cacheInfor.messageInfor.errorMessage.errorTitle,
                message: cacheInfor.messageInfor.errorMessage.enableAdvancePrint
            });
            disableButtons(); 
        }
    }

    /**
     * @desc subsidiary change handler
     * @params {Record} [currentRecord] - Current form record
     * @params {Object} [cacheInfor] - the cacheInfor data
     * @params {Object} [alertfn] - dialog.alert
     */
    function subsidiaryChangeHandler(currentRecord, cacheInfor, alertfn) {
        var periodField = currentRecord.getField({
            fieldId: 'custpage_asof'
        });
        var subsidiaryId = currentRecord.getValue({
            fieldId: 'custpage_subsidiary'
        });
        var defaultPeriod = period_init.initPeriod(periodField, null, subsidiaryId, true, false);
        if (defaultPeriod == null) {
            alertfn({
                title: cacheInfor.messageInfor.errorMessage.errorTitle,
                message: cacheInfor.messageInfor.errorMessage.nullPeriod
            });
        } else {
            // set default value
            currentRecord.setValue({
                fieldId: 'custpage_asof',
                value: defaultPeriod.id,
                ignoreFieldChange: true,
                fireSlavingSync: true
            });
        }

        location_init.initLocation(currentRecord.getField({
            fieldId: 'custpage_location'
        }), null, subsidiaryId, false);

        department_init.initDepartment(currentRecord.getField({
            fieldId: 'custpage_department'
        }), null, subsidiaryId, false);

        class_init.initClass(currentRecord.getField({
            fieldId: 'custpage_class'
        }), null, subsidiaryId, false);
    }

    /**
     * @desc fieldChanged for cs to adapt
     * @params {Record} [currentRecord] - Current form record
     * @params {String} [fieldId] - fieldId
     * @params {Object} [alertfn] - dialog.alert function
     *
     */
    function fieldChanged(currentRecord, fieldId, alertfn) {
        var cacheInfor = JSON.parse(currentRecord.getValue({
            fieldId: 'custpage_cachefield'
        }));
        var calendarEnable = cacheInfor.calendarEnable;

        if (fieldId === ('custpage_subsidiary') && calendarEnable) {
            subsidiaryChangeHandler(currentRecord, cacheInfor, alertfn);
        }
    }



    /**
     * @desc the logic of refresh button
     * @params {Record} [currentRecord] - Current form record
     * @params {Function} [alertfn] - alertfn
     * @params {Object} [params] - params needed by refresh search
     * @params {Function} [postfn] - https.post
     *
     */
    function mainRefreshLogic(currentRecord, alertfn, params, postfn, msg) {
        try {
            var response = _response;
            var responseResult = JSON.parse(response.body);
            params.reportDataId = responseResult.id;

            if (commons.makesure(responseResult.errmsg) && commons.makesure(responseResult.errmsg.exception)) {
                _success = false;
                //Get alert title
                var record = currentRecord.get();
                var cacheInfor = record.getValue({
                    fieldId: 'custpage_cachefield'
                });
                alertfn({
                    title: JSON.parse(cacheInfor).messageInfor.errorMessage.errorTitle,
                    message: responseResult.errmsg.exception
                }).then(success);
                waitAndExecute(isSuccess, function() {
                    refreshBalanceSheetFormIfError(msg);
                });
            } else if (commons.makesure(responseResult.errmsg)) {
                var errmsg = '';
                var record = currentRecord.get();
                var cacheInfor = record.getValue({
                    fieldId: 'custpage_cachefield'
                });
                var messageInfo = JSON.parse(cacheInfor).messageInfor.errorMessage;
                if (commons.makesure(responseResult.errmsg.missingrows)) {
                    errmsg = messageInfo.wrongRowName.replace('RowName', responseResult.errmsg.missingrows);
                }
                if (commons.makesure(responseResult.errmsg.missingcols)) {
                    if (commons.makesure(errmsg)) {
                        errmsg = errmsg + '<br/>';
                    }
                    errmsg = errmsg + messageInfo.wrongColumnName.replace('ColumnName', responseResult.errmsg.missingcols);
                }
                if (commons.makesure(errmsg)) {
                    _success = false;
                    alertfn({
                        title: messageInfo.errorTitle,
                        message: errmsg
                    }).then(success);
                }
                waitAndExecute(isSuccess, function() {
                    refreshBalanceSheetForm(params);
                });
            } else {
                refreshBalanceSheetForm(params);
            }

        } catch (ex) {

        }
    }

    function success(result) {
        if (result) {
            _success = true;
        }

    }

    /**
     * @desc  refresh and show the BalanceSheet form
     * @params {Object} [params] - params needed by refresh search
     *
     */
    function refreshBalanceSheetForm(params) {
        var suiteletUrlForShow = url.resolveScript({
            scriptId: 'customscript_sl_cn_blsheet',
            deploymentId: 'customdeploy_sl_cn_blsheet',
            returnExternalUrl: false,
            params: params
        });
        setWindowChanged(window, false);
        window.location = suiteletUrlForShow;
    }

    function refreshBalanceSheetFormIfError(msg) {
        msg.hide();
        enableButtons();
        setWindowChanged(window, false);
    }


    /**
     * @desc  refresh and show the BalanceSheet filter form
     * @params {Record} [currentRecord] - Current form record
     * @params {Function} [alertfn] - dialog.alert
     * @params {Object} [message] - message
     * @params {Function} [postfn] - https.post
     * @params {Function} [httpprofn] - https.post.promise
     *
     */
    function refreshBLsheetFilterForm(currentRecord, alertfn, message, postfn, httpprofn) {
        // can't refresh again.
        disableButtons();
        _dataReady = false;
        _success = true;
        var params = getQueryParam(currentRecord);
        params.type = 'form';
        if (params.errorMsg != null) {
            alertfn(params.errorMsg);
            enableButtons();
        } else {
            var record = currentRecord.get();
            var cacheInfor = record.getValue({
                fieldId: 'custpage_cachefield'
            });
            var messageInfo = JSON.parse(cacheInfor).messageInfor.errorMessage;
            var msg = message.create({
                title: messageInfo.loading,
                type: message.Type.CONFIRMATION
            });
            msg.show();
            runReportApi(params, msg, httpprofn, postfn);
            waitAndExecute(isDataReady, function() {
                mainRefreshLogic(currentRecord, alertfn, params, postfn, msg);
            });

        }
    }


    /**
     * @desc  get query param for the search
     * @params {Record} [currentRecord] - Current form record
     * @return {Object} - queryParam Object
     */
    function getQueryParam(currentRecord) {
        var record = currentRecord.get();
        var subField = record.getField({
            fieldId: 'custpage_subsidiary'
        });
        var bookId = record.getValue({
            fieldId: 'custpage_accountingbook'
        });
        var subsidiaryId = subField.type === 'select' ? record.getValue({
            fieldId: 'custpage_subsidiary'
        }) : -1;
        var periodId = record.getValue({
            fieldId: 'custpage_asof'
        });
        var unit = record.getValue({
            fieldId: 'custpage_unit'
        });
        //get report name to pass to sl_cn_blsheet as request parameters
        var reportName = record.getText({
            fieldId: 'custpage_reportname'
        });
        var reportNameId = record.getValue({
            fieldId: 'custpage_reportname'
        }); //report id in customer record
        var reportId; //saved report internal id
        var cacheInfor = record.getValue({
            fieldId: 'custpage_cachefield'
        });
        var messageInfo = JSON.parse(cacheInfor).messageInfor.errorMessage;
        var errorMsg;
        if (!commons.makesure(periodId)) {
            errorMsg = {
                title: messageInfo.errorTitle,
                message: messageInfo.nullPeriod
            };
        }
        if (commons.makesure(reportName)) {
            reportId = reportdao.getReportId(reportName);
            if (reportId == null) {
                errorMsg = {
                    title: messageInfo.errorTitle,
                    message: messageInfo.invalidReportName
                };
            }
        } else {
            errorMsg = {
                title: messageInfo.errorTitle,
                message: messageInfo.nullReportName
            };
        }

        var locations = record.getField({
            fieldId: 'custpage_location'
        }) !== null ? record.getValue({
            fieldId: 'custpage_location'
        }) : [];
        if(locations === "-1"){
            locations = null;
        }
        var departments = record.getField({
            fieldId: 'custpage_department'
        }) !== null ? record.getValue({
            fieldId: 'custpage_department'
        }) : [];
        if(departments === "-1"){
            departments = null;
        }
        var classes = record.getField({
            fieldId: 'custpage_class'
        }) !== null ? record.getValue({
            fieldId: 'custpage_class'
        }) : [];
        if(classes === "-1"){
            classes = null;
        }
        var browserType = util.getBrowserType();
        return {
            reportName: reportName,
            reportNameId: reportNameId,
            reportId: reportId,
            subsidiaryId: subsidiaryId,
            periodId: periodId,
            bookId: bookId,
            unit: unit,
            errorMsg: errorMsg,
            browserType: browserType,
            locationId: locations,
            departmentId: departments,
            classId: classes
        };
    }

    /**
     * @desc  run report api 1.0
     * @params {Record} [currentRecord] - Current form record
     * @params {Object} [params] - queryParam Object
     * @params {Object} [message] - message
     * @params {Function} [httpprofn] - https.post.promise
     * @params {Function} [postfn] - https.post
     */
    function runReportApi(params, msg, httpprofn, httppost) {

        // invoke run report api
        try {
            var suiteletUrlForReportApi = url.resolveScript({
                scriptId: 'customscript_sl_cn_run_report',
                deploymentId: 'customdeploy_sl_cn_run_report',
                returnExternalUrl: false,
                params: params
            });
            // support different browser
            if (params.browserType.indexOf("IE") >= 0) {
                _response = httppost({
                    url: suiteletUrlForReportApi,
                    body: params
                });
                _dataReady = true;
            } else {
                httpprofn({
                    url: suiteletUrlForReportApi,
                }).then(function(response) {
                    _response = response;
                    _dataReady = true;
                }).catch(function(reason) {
                    msg.hide();
                    var errormsg = message.create({
                        title: reason,
                        type: message.Type.ERROR
                    });
                    errormsg.show();
                })
            }

        } catch (ex) {

        }
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
    
    return {
        setDataAndRespReady: setDataAndRespReady,
        exportExcel: exportExcel,
        exportPDF: exportPDF,
        refreshBLsheetFilterForm: refreshBLsheetFilterForm,
        pageInit: pageInit,
        fieldChanged: fieldChanged
    };
});
