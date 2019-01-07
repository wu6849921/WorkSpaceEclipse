/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define([
    '../../lib/wrapper/ns_wrapper_url',
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../lib/commons',
    '../../lib/util',
    '../../dao/cn_savedreports_dao',
    '../../dao/cn_accounting_period_dao',
    '../../dao/cn_account_dao',
    '../../lib/wrapper/ns_wrapper_format',
    '../../lib/wrapper/ns_wrapper_error',
    '../../lib/excelexportutil',
    '../../app/cashflow/app_cn_cashflow_period_init',
    '../../lib/wrapper/ns_wrapper_search',
    '../../dao/helper/search_helper',
    '../../app/balance_sheet/app_cn_blsheet_location_init',
    '../../app/balance_sheet/app_cn_blsheet_department_init',
    '../../app/balance_sheet/app_cn_blsheet_class_init'
], function(url, runtime, commons, util, reportDao, periodDao, accountDao, formatter, error, exportExcelUtil, period_init, search, helper, location_init, department_init, class_init) {
    var _loadingMessage;
    
    /**
     * NSCHINA-2770 Alert message if default posting period is empty.
     */
    function pageInit(form, alertfn) {
        var cacheInfo = JSON.parse(form.getValue({
            fieldId: 'custpage_cachefield'
        }));
        if (!commons.makesure(cacheInfo.accountPeriods)) {
            alertfn({
                title: cacheInfo.messageInfo.errorTitle,
                message: cacheInfo.messageInfo.nullPeriod
            });
        }
    }

    function showLoadingMessage(message) {
        if(!_loadingMessage) {
            _loadingMessage = message.create({
                title: runtime.getCurrentUser().getPreference('LANGUAGE') === 'zh_CN' ? '\u6570\u636e\u52a0\u8f7d\u4e2d...' : 'Loading...',
                type: message.Type.CONFIRMATION
            });
        }
        _loadingMessage.show();
    }
    
    function hideLoadingMessage() {
        _loadingMessage.hide();
    }

    function disableButtons(form) {
        disableButton(form, 'refresh');
        disableButton(form, 'custpage_export_excel');
        disableButton(form, 'custpage_export_pdf');
    }

    /**
     * Disable button with given fieldId.
     */
    function disableButton(form, buttonId) {
        var btn = form.getField({
            fieldId: buttonId
        });
        if (btn) {
            btn.isDisabled = true;
        }
    }

    /**
     * @desc refresh cash flow filter form
     * @param {object} [form] - cash flow form.
     * @param {alertfn} - dialog.alert.
     * @param {httpsGetPromise} - https.get.promise.
     * @param {message} - N/ui/message module.
     */
    function refreshCashFlowFilterForm(form, alertfn, httpsGetPromise, message) {
        disableButtons(form);
        showLoadingMessage(message);
        runStandardReports(form, alertfn, httpsGetPromise);
    }

    function runStandardReports(form, alertfn, httpsGetPromise) {
        httpsGetPromise({
            url: prepareRunStandardReportURL(form)
        }).then(function(response) {
            var balanceForAllObject = JSON.parse(response.body);
            var params = {
                format: 'page',
                reset: false,
                endBalanceCurrent: balanceForAllObject.endBalanceCurrent,
                endBalancePrior: balanceForAllObject.endBalancePrior,
                startBalanceCurrent: balanceForAllObject.startBalanceCurrent,
                startBalancePrior: balanceForAllObject.startBalancePrior,
                unrealizedGainAndLossCurrent: balanceForAllObject.unrealizedGainAndLossCurrent,
                unrealizedGainAndLossPrior: balanceForAllObject.unrealizedGainAndLossPrior
            }
            window.location = suiteletUrl(form, params);
        }).catch(function(ex) {
            handleRunStandardReportsException(ex, form, alertfn);
        });
    }
    
    function prepareRunStandardReportURL(form) {
        var runStandardReportsURL = url.resolveScript({
            scriptId: 'customscript_rl_cn_run_cashflow_reports',
            deploymentId: 'customdeploy_rl_cn_run_cashflow_reports',
            params: {
                subsidiary: form.getValue({
                    fieldId: 'custpage_subsidiary'
                }),
                periodFrom: form.getValue({
                    fieldId: 'custpage_periodfrom'
                }),
                periodTo: form.getValue({
                    fieldId: 'custpage_periodto'
                }),
                fiscalCalendar: form.getValue({
                    fieldId: 'custpage_fiscalcalendar'
                }),
                //NSCHINA-2428
                //Add single selection for location/department/class on China Cash Flow Page
                location: form.getValue({
                    fieldId: 'custpage_location'
                }) === '-1' ? null : form.getValue({
                    fieldId: 'custpage_location'
                }),
                department: form.getValue({
                    fieldId: 'custpage_department'
                }) === '-1' ? null : form.getValue({
                    fieldId: 'custpage_department'
                }),
                classification: form.getValue({
                    fieldId: 'custpage_class'
                }) === '-1' ? null : form.getValue({
                    fieldId: 'custpage_class'
                })
            }
        });
        return runStandardReportsURL;
    }
    
    function handleRunStandardReportsException(ex, form, alertfn) {
        var cacheInfor = form.getValue({
            fieldId: 'custpage_cachefield'
        });
        alertfn({
            title: JSON.parse(cacheInfor).messageInfo.errorTitle,
            message: ex.message
        });
        hideLoadingMessage();
    }

    /**
     * @desc export the file as excel format.
     * @params {object} [form] - cash flow form.
     */

    function exportExcel(form) {
        var cacheInfor = form.getValue({
            fieldId: 'custpage_cachefield'
        });

        var fileName = JSON.parse(cacheInfor).exportname;
        if (window.navigator.msSaveOrOpenBlob) {
            var blobData = exportExcelUtil.getExportBlobForCashFlow('cashflow_report');
            window.navigator.msSaveOrOpenBlob(blobData, fileName);
        } else {
            var excelUrl = exportExcelUtil.getExportCashFlowUrl('cashflow_report');
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
     * @desc export file as pdf format.
     * @param {record} [record] - cash flow form.
     * @param {alertfn} - dialog.alert.
     * @param {postfn} - https.post.
     */
    function exportCashFlowAsPDF(form, alertfn, postfn) {
        var cacheInfor = form.getValue({
            fieldId: 'custpage_cachefield'
        });
        var fileNamePrefix = JSON.parse(cacheInfor).cashflow_fileNamePrefix;
        var fileName = fileNamePrefix + '.pdf';
        var params = {
            format: 'pdf',
            reset: false
        }
        try {
            var suiteletUrlForPDF = url.resolveScript({
                scriptId: 'customscript_sl_cn_cashflow',
                deploymentId: 'customdeploy_sl_cn_cashflow',
                returnExternalUrl: false,
                params: params
            });
            var httpsResp = postfn({
                url: suiteletUrlForPDF,
                body: document.getElementById('cashflow_header').outerHTML + document.getElementById('cashflow_data').outerHTML
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
                title: JSON.parse(cacheInfor).messageInfo.errorTitle,
                message: JSON.parse(cacheInfor).messageInfo.errorExportPDF
            });
        }
    }

    /**
     * @desc field change for cash flow form.
     * @param {object} [form] - cash flow form.
     * @param {fieldId} - changed field id.
     * @param {alertfn} - dialog.alert.
     * @param {originalPeriodFrom} - original period from.
     * @param {originalPeriodTo} - original period to.
     */
    function fieldChanged(currentRecord, form, fieldId, alertfn, originalPeriodFrom, originalPeriodTo) {
        var cacheInfor = form.getValue({
            fieldId: 'custpage_cachefield'
        });
        var cacheObj = JSON.parse(cacheInfor);
        var from;
        var to;

        if (fieldId === 'custpage_subsidiary') {
            if (runtime.isMultipleCalendars()) {
                subsidiaryChangeHandler(currentRecord, cacheInfor, alertfn);
            }
        } else if (fieldId === 'custpage_periodfrom') {
            if (commons.makesure(cacheObj.accountPeriods)) {
                // get the accounting periods from cache first
                from = formatter.parseDate(cacheObj.accountPeriods[form.getValue('custpage_periodfrom')].startdate);
                to = formatter.parseDate(cacheObj.accountPeriods[form.getValue('custpage_periodto')].enddate);
            } else {
                from = formatter.parseDate(periodDao.getDateRange(form.getValue('custpage_periodfrom')).startdate);
                to = formatter.parseDate(periodDao.getDateRange(form.getValue('custpage_periodto')).enddate);
            }

            if (from > to) {
                alertfn({
                    title: error.Message.Alert,
                    message: error.Message.InvalidPeriodRange
                }).then(form.setValue({
                    fieldId: 'custpage_periodfrom',
                    value: originalPeriodFrom
                }));
            }
        } else if (fieldId === 'custpage_periodto') {
            if (commons.makesure(cacheObj.accountPeriods)) {
                // get the accounting periods from cache first
                from = formatter.parseDate(cacheObj.accountPeriods[form.getValue('custpage_periodfrom')].startdate);
                to = formatter.parseDate(cacheObj.accountPeriods[form.getValue('custpage_periodto')].enddate);
            } else {
                from = formatter.parseDate(periodDao.getDateRange(form.getValue('custpage_periodfrom')).startdate);
                to = formatter.parseDate(periodDao.getDateRange(form.getValue('custpage_periodto')).enddate);
            }

            if (from > to) {
                alertfn({
                    title: error.Message.Alert,
                    message: error.Message.InvalidPeriodRange
                }).then(form.setValue({
                    fieldId: 'custpage_periodto',
                    value: originalPeriodTo
                }));
            }
        }
    }
    
    /**
     * @desc call suitelet customscript_sl_cn_cashflow.
     * @param {form} - cash flow form.
     * @param {params} - params for suitelet.
     * @returns run script result.
     */
    function suiteletUrl(form, params) {
        var format = commons.isPrimitive(params) ? params : params.format;
        var reset = commons.isPrimitive(params) ? false : params.reset;
        var endBalanceCurrent = commons.isPrimitive(params) ? null : params.endBalanceCurrent;
        var endBalancePrior = commons.isPrimitive(params) ? null : params.endBalancePrior;
        var startBalanceCurrent = commons.isPrimitive(params) ? null : params.startBalanceCurrent;
        var startBalancePrior = commons.isPrimitive(params) ? null : params.startBalancePrior;
        var unrealizedGainAndLossCurrent = commons.isPrimitive(params) ? null : params.unrealizedGainAndLossCurrent;
        var unrealizedGainAndLossPrior = commons.isPrimitive(params) ? null : params.unrealizedGainAndLossPrior;
        if (reset) {
            return url.resolveScript({
                scriptId: 'customscript_sl_cn_cashflow',
                deploymentId: 'customdeploy_sl_cn_cashflow',
                params: {
                    filter: JSON.stringify({
                        subsidiary: form.getValue({
                            fieldId: 'custpage_subsidiary'
                        }),
                        format: format,
                        reset: reset
                    })
                }
            });
        } else {
            return url.resolveScript({
                scriptId: 'customscript_sl_cn_cashflow',
                deploymentId: 'customdeploy_sl_cn_cashflow',
                params: {
                    filter: JSON.stringify({
                        subsidiary: form.getValue({
                            fieldId: 'custpage_subsidiary'
                        }),
                        subsidiaryName: form.getText({
                            fieldId: 'custpage_subsidiary'
                        }),
                        unit: form.getValue({
                            fieldId: 'unit'
                        }),
                        unitName: form.getText({
                            fieldId: 'unit'
                        }),
                        //NSCHINA-2428
                        //Add location/department/classfication filter
                        location: form.getValue({
                            fieldId: 'custpage_location'
                        }),
                        locationName: form.getText({
                            fieldId: 'custpage_location'
                        }),
                        department: form.getValue({
                            fieldId: 'custpage_department'
                        }),
                        departmentName: form.getText({
                            fieldId: 'custpage_department'
                        }),
                        classification: form.getValue({
                            fieldId: 'custpage_class'
                        }),
                        className: form.getText({
                            fieldId: 'custpage_class'
                        }),
                        period: {
                            from: form.getValue({
                                fieldId: 'custpage_periodfrom'
                            }),
                            to: form.getValue({
                                fieldId: 'custpage_periodto'
                            })
                        },
                        periodName: {
                            fromName: trim(form.getText({
                                fieldId: 'custpage_periodfrom'
                            })),
                            toName: trim(form.getText({
                                fieldId: 'custpage_periodto'
                            }))
                        },
                        endBalanceCurrent: endBalanceCurrent,
                        endBalancePrior: endBalancePrior,
                        startBalanceCurrent: startBalanceCurrent,
                        startBalancePrior: startBalancePrior,
                        unrealizedGainAndLossCurrent: unrealizedGainAndLossCurrent,
                        unrealizedGainAndLossPrior: unrealizedGainAndLossPrior
                    }),
                    format: format
                }
            });
        }
    }

    /**
     * @desc check if period range cross fiscal year.
     * @param {form} - cash flow form.
     * @param {alertfn} - dialog alert.
     * @param {prePeriodFromForFiscalCheck} - previous period from for fiscal check.
     * @param {prePeriodToForFiscalCheck} - previous period to for fiscal check.
     * @returns return true or false according to check result.
     */
    function isPeriodRangeCrossFiscalYear(form, alertfn, prePeriodFromForFiscalCheck, prePeriodToForFiscalCheck) {

        var cacheInfor = form.getValue({
            fieldId: 'custpage_cachefield'
        });
        var cacheObj = JSON.parse(cacheInfor);
        if (!commons.makesure(form.getValue('custpage_periodfrom')) || !commons.makesure(form.getValue('custpage_periodto'))) {
            alertfn({
                title: cacheObj.messageInfo.errorTitle,
                message: cacheObj.messageInfo.nullPeriod
            });
            return true;
        }

        var from;
        var to;
        if (commons.makesure(cacheObj.accountPeriods)) {
            // get the accounting periods from cache first
            from = formatter.parseDate(cacheObj.accountPeriods[form.getValue('custpage_periodfrom')].startdate);
            to = formatter.parseDate(cacheObj.accountPeriods[form.getValue('custpage_periodto')].enddate);
        } else {
            from = formatter.parseDate(periodDao.getDateRange(form.getValue('custpage_periodfrom')).startdate);
            to = formatter.parseDate(periodDao.getDateRange(form.getValue('custpage_periodto')).enddate);
        }

        var isSameFiscalYear = from.getFullYear() === to.getFullYear();

        if (!isSameFiscalYear) {
            alertfn({
                title: cacheObj.messageInfo.errorTitle,
                message: cacheObj.messageInfo.PeriodRangeCrossFiscalYear
            }).then(setPreviousValueToPeriodFromTo(form, prePeriodFromForFiscalCheck, prePeriodToForFiscalCheck));

            return true;
        }
        return false;
    }

    /**
     * @desc set periodfrom and periodto.
     * @param {prePeriodFromForFiscalCheck} - previous period from for fiscal check.
     * @param {prePeriodToForFiscalCheck} - previous period to for fiscal check. 
     */
    function setPreviousValueToPeriodFromTo(form, prePeriodFromForFiscalCheck, prePeriodToForFiscalCheck) {
        form.setValue({
            fieldId: 'custpage_periodfrom',
            value: prePeriodFromForFiscalCheck,
            ignoreFieldChange: true
        });

        form.setValue({
            fieldId: 'custpage_periodto',
            value: prePeriodToForFiscalCheck,
            ignoreFieldChange: true
        });
    }

    /**
     * @desc subsidiary change handler
     * @params {Record} [currentRecord] - Current form record
     * @params {Object} [cacheInfor] - the cacheInfor data
     * @params {Object} [alertfn] - dialog.alert
     */
    function subsidiaryChangeHandler(currentRecord, cacheInfor, alertfn) {
        var periodFieldFrom = currentRecord.getField({
            fieldId: 'custpage_periodfrom'
        });
        var periodFieldTo = currentRecord.getField({
            fieldId: 'custpage_periodto'
        });
        var subsidiary = currentRecord.getValue({
            fieldId: 'custpage_subsidiary'
        });
        var calendarId = period_init.fetchCalendarIdBySubsidiary(subsidiary, true);
        currentRecord.setValue({
            fieldId: 'custpage_fiscalcalendar',
            value: calendarId,
            ignoreFieldChange: true
        });
        var rs = period_init.fetchPeriodByCalendarId(calendarId, true);
        // refresh the accounting periods cache because of the subsidiary change
        refreshCacheInfor(currentRecord, rs);
        var defaultPeriodFrom = period_init.initPeriod(periodFieldFrom, null, rs, subsidiary, false);
        var defaultPeriodTo = period_init.initPeriod(periodFieldTo, null, rs, subsidiary, false);
        if (rs === null || rs === undefined || rs.length === 0) {
            var cacheObj = JSON.parse(cacheInfor);
            alertfn({
                title: cacheObj.messageInfo.errorTitle,
                message: cacheObj.messageInfo.nullPeriod
            });
        } else {
            // set default value
            currentRecord.setValue({
                fieldId: 'custpage_periodfrom',
                value: defaultPeriodFrom.id,
                ignoreFieldChange: true
            });
            currentRecord.setValue({
                fieldId: 'custpage_periodto',
                value: defaultPeriodTo.id,
                ignoreFieldChange: true
            });
        }

        //NSCHINA-2428
        //Update select options for location/department/field with subsidiary change
        location_init.initLocation(currentRecord.getField({
            fieldId: 'custpage_location'
        }), null, subsidiary, false);

        department_init.initDepartment(currentRecord.getField({
            fieldId: 'custpage_department'
        }), null, subsidiary, false);

        class_init.initClass(currentRecord.getField({
            fieldId: 'custpage_class'
        }), null, subsidiary, false);

    }

    /**
     * @desc refresh cache info after subsidiary changes
     * @params {Record} [currentRecord] - Current form record
     * @params {Object} [subsidiary] - the subsidiary
     */
    function refreshCacheInfor(currentRecord, rs) {
        // Refresh all the accounting periods of the selected subsidiary
        var accountPeriods = {};
        if (commons.makesure(rs)) {
            for ( var i in rs) {
                accountPeriods[rs[i].id] = {
                    startdate: rs[i].getValue('startdate'),
                    enddate: rs[i].getValue('enddate')
                };
            }
        }

        var cacheInfor = currentRecord.getValue({
            fieldId: 'custpage_cachefield'
        });
        var cacheObj = JSON.parse(cacheInfor);
        // Update the cache and set it back
        cacheObj.accountPeriods = accountPeriods;
        currentRecord.setValue({
            fieldId: 'custpage_cachefield',
            value: JSON.stringify(cacheObj)
        });
    }

    return {
        pageInit: pageInit,
        refreshCashFlowFilterForm: refreshCashFlowFilterForm,
        exportCashFlowAsPDF: exportCashFlowAsPDF,
        fieldChanged: fieldChanged,
        exportExcel: exportExcel,
        isPeriodRangeCrossFiscalYear: isPeriodRangeCrossFiscalYear
    };
});
