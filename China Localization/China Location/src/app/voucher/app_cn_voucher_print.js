/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/wrapper/ns_wrapper_currentRecord',
    '../../lib/wrapper/ns_wrapper_url',
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../lib/commons',
    '../../lib/wrapper/ns_wrapper_error',
    '../../lib/wrapper/ns_wrapper_dialog',
    '../../dao/cn_accounting_period_dao',
    '../../lib/wrapper/ns_wrapper_format',
    '../../constant/constant_cn_voucher',
    '../../dao/cn_voucher_client_dao',
    '../../lib/wrapper/ns_wrapper_https',
],

function(currentRecord, url, runtime, commons, error, dialog, periodDao, formatter, constants, voucherDao, https) {
    var form = null;
    var originalPeriodFrom = null;
    var originalPeriodTo = null;
    var originalTrandateFrom = null;
    var originalTrandateTo = null;

    function pageInit(context) {
        form = currentRecord.get();
        originalPeriodFrom = form.getValue('periodfrom');
        originalPeriodTo = form.getValue('periodto');
        originalTrandateFrom = form.getValue('trandatefrom');
        originalTrandateTo = form.getValue('trandateto');
        if (!commons.ensure(originalPeriodFrom)) {
            dialog.alert({
                title: error.Message.Error,
                message: error.Message.NullPeriod
            });
        }
    }

    function printVoucher() {
        var filter = currentRecord.get().id;
        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript_sl_cn_voucher_print',
            deploymentId: 'customdeploy_sl_cn_voucher_print',
            params: {
                filter: filter,
                format: constants.FORMAT_PDF_ONLINE
            }
        });
        window.open(suiteletUrl);
    }

    function refreshVoucherFilterForm() {
        if (isValidDateRange()) {
            setWindowChanged(window, false);
            window.location = suiteletUrl({
                format: constants.FORMAT_PAGE,
                selectpage: constants.SELECT_PAGE,
                transperpage: getTransPerPageValue()
            });
        }
    }

    function refreshForModifyingSelectPage() {
        if (isValidDateRange()) {
            setWindowChanged(window, false);
            window.location = suiteletUrl({
                format: constants.FORMAT_PAGE,
                selectpage: getSelectPageValue(),
                transperpage: getTransPerPageValue()
            });
        }
    }

    function printVouchersAsPDF() {
        if (isValidDateRange()) {
            var totalCount = voucherDao.getTransactionLineTotalCount(suiteletFilter({}));

            if (totalCount <= constants.REPORT_RUN_MODE_THRESHOLD) {
                window.open(suiteletUrl({
                    format: constants.FORMAT_PDF_ONLINE
                }));
            } else {
                dialog.confirm({
                    title: error.Message.Alert,
                    message: error.Message.PDFReportBackgroundPrintMessage
                }).then(confirmedToPrintPDFInBackend);
            }
        }
    }

    function confirmedToPrintPDFInBackend(result) {
        if (result)
            https.get(suiteletUrl({
                format: constants.FORMAT_PDF_SCHEDULE
            }));
    }

    function isValidDateRange() {
        if (((!commons.ensure(form.getValue('trandatefrom'))) && commons.ensure(form.getValue('trandateto'))) || (commons.ensure(form.getValue('trandatefrom')) && (!commons.ensure(form.getValue('trandateto'))))) {
            dialog.alert({
                title: error.Message.Alert,
                message: error.Message.InvalidDateRange
            });

            return false;
        } else {
            return true;
        }
    }

    function suiteletUrl(params) {
        var format = commons.isPrimitive(params) ? params : params.format;
        var reset = commons.isPrimitive(params) ? false : params.reset;
        var form = currentRecord.get();

        if (reset) {
            return url.resolveScript({
                scriptId: 'customscript_sl_cn_voucher_print',
                deploymentId: 'customdeploy_sl_cn_voucher_print',
                params: {
                    filter: JSON.stringify({
                        subsidiary: form.getValue({
                            fieldId: 'subsidiary'
                        }),
                        format: format,
                        reset: reset
                    })
                }
            });
        } else {
            return url.resolveScript({
                scriptId: 'customscript_sl_cn_voucher_print',
                deploymentId: 'customdeploy_sl_cn_voucher_print',
                params: {
                    filter: JSON.stringify(suiteletFilter(params)),
                    format: format
                }
            });
        }
    }

    function suiteletFilter(params) {
        var form = currentRecord.get();

        return {
            subsidiary: form.getValue({
                fieldId: 'subsidiary'
            }),
            period: {
                from: form.getValue({
                    fieldId: 'periodfrom'
                }),
                to: form.getValue({
                    fieldId: 'periodto'
                })
            },
            trandate: {
                from: form.getText({
                    fieldId: 'trandatefrom'
                }),
                to: form.getText({
                    fieldId: 'trandateto'
                })
            },
            glnumber: {
                oper: form.getValue({
                    fieldId: 'glnumberoper'
                }),
                value: form.getValue({
                    fieldId: 'glnumberval'
                })
            },
            location: form.getValue({
                fieldId: 'location'
            }) ? form.getValue({
                fieldId: 'location'
            }) : null,

            department: form.getValue({
                fieldId: 'department'
            }) ? form.getValue({
                fieldId: 'department'
            }) : null,

            classes: form.getValue({
                fieldId: 'class'
            }) ? form.getValue({
                fieldId: 'class'
            }) : null,

            selectpage: params.selectpage,
            transperpage: params.transperpage,
            template: form.getValue({
                fieldId: 'template'
            })
        }
    }

    function fieldChanged(context) {
        var from;
        var to;
        if (context.fieldId === 'subsidiary') {
            if (runtime.isMultipleCalendars()) {
                setWindowChanged(window, false);
                window.location = suiteletUrl({
                    format: constants.FORMAT_PAGE,
                    reset: true
                });
            }
        } else if (context.fieldId === 'periodfrom') {
            from = formatter.parseDate(periodDao.getDateRange(form.getValue('periodfrom')).startdate);
            to = formatter.parseDate(periodDao.getDateRange(form.getValue('periodto')).enddate);

            if (from > to) {
                dialog.alert({
                    title: error.Message.Alert,
                    message: error.Message.InvalidPeriodRange
                }).then(form.setValue({
                    fieldId: 'periodfrom',
                    value: originalPeriodFrom
                }));
            }

            originalPeriodFrom = form.getValue('periodfrom');
        } else if (context.fieldId === 'periodto') {
            from = formatter.parseDate(periodDao.getDateRange(form.getValue('periodfrom')).startdate);
            to = formatter.parseDate(periodDao.getDateRange(form.getValue('periodto')).enddate);

            if (from > to) {
                dialog.alert({
                    title: error.Message.Alert,
                    message: error.Message.InvalidPeriodRange
                }).then(form.setValue({
                    fieldId: 'periodto',
                    value: originalPeriodTo
                }));
            }

            originalPeriodTo = form.getValue('periodto');
        } else if (context.fieldId === 'trandatefrom') {
            if (commons.ensure(form.getValue('trandatefrom')) && commons.ensure(form.getValue('trandateto'))) {
                from = formatter.parseDate(form.getValue('trandatefrom'));
                to = formatter.parseDate(form.getValue('trandateto'));
                if (from > to) {
                    dialog.alert({
                        title: error.Message.Alert,
                        message: error.Message.InvalidDateRange
                    }).then(form.setValue({
                        fieldId: 'trandatefrom',
                        value: originalTrandateFrom
                    }));
                }
            }
            originalTrandateFrom = form.getValue('trandatefrom');
        } else if (context.fieldId === 'trandateto') {
            if (commons.ensure(form.getValue('trandatefrom')) && commons.ensure(form.getValue('trandateto'))) {
                from = formatter.parseDate(form.getValue('trandatefrom'));
                to = formatter.parseDate(form.getValue('trandateto'));
                if (from > to) {
                    dialog.alert({
                        title: error.Message.Alert,
                        message: error.Message.InvalidDateRange
                    }).then(form.setValue({
                        fieldId: 'trandateto',
                        value: originalTrandateTo
                    }));
                }
            }
            originalTrandateTo = form.getValue('trandateto');
        } else if (context.fieldId === 'template') {
            if (form.getValue('template') === 'Multiple_Currencies') {
                disableCheckboxField(form, 'location');
                disableCheckboxField(form, 'department');
                disableCheckboxField(form, 'class');
            } else {
                enableCheckboxField(form, 'location');
                enableCheckboxField(form, 'department');
                enableCheckboxField(form, 'class');
            }
        } else if (context.fieldId === 'transperpage') {
            refreshVoucherFilterForm();
        } else if (context.fieldId === 'selectpage') {
            refreshForModifyingSelectPage();
        }
    }

    /**
     * Enable checkbox field if field exists.
     */
    function enableCheckboxField(form, internalId) {
        var checkboxFld = form.getField(internalId);
        if (checkboxFld) {
            checkboxFld.isDisabled = false;
        }
    }

    /**
     * Uncheck and disable checkbox field if field exists.
     */
    function disableCheckboxField(form, internalId) {
        var checkboxFld = form.getField(internalId);
        if (checkboxFld) {
            // serverWidget.Field does not have setValue API
            var inputElement = document.getElementById(internalId + '_fs_inp');
            if (inputElement) {
                inputElement.checked = false;
            }
            checkboxFld.isDisabled = true;
        }
    }

    function getTransPerPageValue() {
        var transperpage = form.getValue({
            fieldId: 'transperpage'
        });

        return commons.ensure(transperpage) ? transperpage : constants.TRANS_PER_PAGE[0];
    }

    function getSelectPageValue() {
        var selectpage = form.getValue({
            fieldId: 'selectpage'
        });

        return commons.ensure(selectpage) ? selectpage : constants.SELECT_PAGE;
    }

    return {
        printVoucher: printVoucher,
        refreshVoucherFilterForm: refreshVoucherFilterForm,
        printVouchersAsPDF: printVouchersAsPDF,
        fieldChanged: fieldChanged,
        pageInit: pageInit
    };
});
