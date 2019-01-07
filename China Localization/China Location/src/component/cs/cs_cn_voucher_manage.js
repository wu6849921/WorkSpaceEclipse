/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/wrapper/ns_wrapper_currentRecord',
    '../../lib/commons',
    '../../lib/wrapper/ns_wrapper_format',
    '../../lib/wrapper/ns_wrapper_url',
    '../../lib/wrapper/ns_wrapper_error',
    '../../lib/wrapper/ns_wrapper_dialog',
    '../../app/helper/voucherManage_helper'
],

function(currentRecord, commons, formatter, url, error, dialog, voucherManageHelper) {

    function fieldChanged(context) {
        var currRecord = context.currentRecord;
        var fieldId = context.fieldId;
        if (fieldId === 'subsidiary') {
            var subsidiary = currRecord.getValue({
                fieldId: 'subsidiary'
            });
            refreshForm({
                subsidiary: subsidiary
            });
        } else if (fieldId === 'custrecord_end_date') {
            var endDate = currRecord.getCurrentSublistValue({
                sublistId: context.sublistId,
                fieldId: 'custrecord_end_date'
            });
            if (commons.makesure(endDate)) {
                var startDate = currRecord.getCurrentSublistValue({
                    sublistId: context.sublistId,
                    fieldId: 'custrecord_start_date'
                });
                if (commons.makesure(startDate) && startDate > endDate) {
                    var originalDateString = currRecord.getCurrentSublistValue({
                        sublistId: context.sublistId,
                        fieldId: 'custrecord_end_date_hidden'
                    });
                    var originalDate = commons.makesure(originalDateString)
                        ? formatter.parseDate(originalDateString) : null;
                    dialog.alert({
                        title: error.Message.Alert,
                        message: error.Message.InvalidStartOrEndDate
                    }).then(currRecord.setCurrentSublistValue({
                        sublistId: context.sublistId,
                        fieldId: 'custrecord_end_date',
                        value: originalDate
                    }));
                }
            }
            endDate = currRecord.getCurrentSublistValue({
                sublistId: context.sublistId,
                fieldId: 'custrecord_end_date'
            });
            currRecord.setCurrentSublistValue({
                sublistId: context.sublistId,
                fieldId: 'custrecord_end_date_hidden',
                value: commons.makesure(endDate)
                    ? formatter.formatDate(endDate) : ''
            });
        } else if (fieldId === 'custrecord_start_date') {
            var startDate = currRecord.getCurrentSublistValue({
                sublistId: context.sublistId,
                fieldId: 'custrecord_start_date'
            });
            if (commons.makesure(startDate)) {
                var endDate = currRecord.getCurrentSublistValue({
                    sublistId: context.sublistId,
                    fieldId: 'custrecord_end_date'
                });
                if (commons.makesure(endDate) && startDate > endDate) {
                    var originalDateString = currRecord.getCurrentSublistValue({
                        sublistId: context.sublistId,
                        fieldId: 'custrecord_start_date_hidden'
                    });
                    var originalDate = commons.makesure(originalDateString)
                        ? formatter.parseDate(originalDateString) : null;
                    dialog.alert({
                        title: error.Message.Alert,
                        message: error.Message.InvalidStartOrEndDate
                    }).then(currRecord.setCurrentSublistValue({
                        sublistId: context.sublistId,
                        fieldId: 'custrecord_start_date',
                        value: originalDate
                    }));
                }
            }
            startDate = currRecord.getCurrentSublistValue({
                sublistId: context.sublistId,
                fieldId: 'custrecord_start_date'
            });
            currRecord.setCurrentSublistValue({
                sublistId: context.sublistId,
                fieldId: 'custrecord_start_date_hidden',
                value: commons.makesure(startDate)
                    ? formatter.formatDate(startDate) : ''
            });
        }
    }

    function cancelChange() {
        var currRecord = currentRecord.get();
        var subsidiary = currRecord.getValue({
            fieldId: 'subsidiary'
        });
        refreshForm({
            subsidiary: subsidiary
        });
    }

    function refreshForm(params) {
        setWindowChanged(window, false);
        window.location = url.resolveScript({
            scriptId: 'customscript_sl_cn_voucher_manage',
            deploymentId: 'customdeploy_sl_cn_voucher_manage',
            params: {
                filter: JSON.stringify(params)
            }
        });
    }

    function lineInit(context) {
        var currRecord = context.currentRecord;
        var selectedLineNumber = currRecord.getCurrentSublistIndex(context.sublistId);

        if (selectedLineNumber < currRecord.getLineCount(context.sublistId)) {
            currRecord.getSublistField({
                sublistId: context.sublistId,
                fieldId: 'custrecord_transaction_type',
                line: selectedLineNumber
            }).isDisabled = true;

            currRecord.getSublistField({
                sublistId: context.sublistId,
                fieldId: 'custrecord_type',
                line: selectedLineNumber
            }).isDisabled = true;

            currRecord.getSublistField({
                sublistId: context.sublistId,
                fieldId: 'custrecord_user',
                line: selectedLineNumber
            }).isDisabled = true;

            currRecord.getSublistField({
                sublistId: context.sublistId,
                fieldId: 'custrecord_start_date',
                line: selectedLineNumber
            }).isDisabled = true;

            currRecord.getSublistField({
                sublistId: context.sublistId,
                fieldId: 'custrecord_end_date',
                line: selectedLineNumber
            }).isDisabled = false;

            var endDate = currRecord.getSublistValue({
                sublistId: context.sublistId,
                fieldId: 'custrecord_end_date',
                line: selectedLineNumber
            });

            if (commons.makesure(endDate) && endDate < new Date().setHours(0, 0, 0, 0)) {
                currRecord.getSublistField({
                    sublistId: context.sublistId,
                    fieldId: 'custrecord_end_date',
                    line: selectedLineNumber
                }).isDisabled = true;
            }
        } else if (selectedLineNumber !== 0) {
            currRecord.getSublistField({
                sublistId: context.sublistId,
                fieldId: 'custrecord_transaction_type',
                line: selectedLineNumber - 1
            }).isDisabled = false;

            currRecord.getSublistField({
                sublistId: context.sublistId,
                fieldId: 'custrecord_type',
                line: selectedLineNumber - 1
            }).isDisabled = false;

            currRecord.getSublistField({
                sublistId: context.sublistId,
                fieldId: 'custrecord_user',
                line: selectedLineNumber - 1
            }).isDisabled = false;

            currRecord.getSublistField({
                sublistId: context.sublistId,
                fieldId: 'custrecord_start_date',
                line: selectedLineNumber - 1
            }).isDisabled = false;

            currRecord.getSublistField({
                sublistId: context.sublistId,
                fieldId: 'custrecord_end_date',
                line: selectedLineNumber - 1
            }).isDisabled = false;
        }
    }

    function validateLine(context) {
        var currRecord = context.currentRecord;

        var newTransactionType = currRecord.getCurrentSublistValue({
            sublistId: context.sublistId,
            fieldId: 'custrecord_transaction_type'
        });

        var newType = currRecord.getCurrentSublistValue({
            sublistId: context.sublistId,
            fieldId: 'custrecord_type'
        });

        var newStartDate = currRecord.getCurrentSublistValue({
            sublistId: context.sublistId,
            fieldId: 'custrecord_start_date'
        });

        var newEndDate = currRecord.getCurrentSublistValue({
            sublistId: context.sublistId,
            fieldId: 'custrecord_end_date'
        });

        var selectedLineNumber = currRecord.getCurrentSublistIndex(context.sublistId);
        for (var index = 0; index < currRecord.getLineCount(context.sublistId); index++) {
            if (index !== selectedLineNumber) {
                var oldTransactionType = currRecord.getSublistValue({
                    sublistId: context.sublistId,
                    fieldId: 'custrecord_transaction_type',
                    line: index
                });

                var oldType = currRecord.getSublistValue({
                    sublistId: context.sublistId,
                    fieldId: 'custrecord_type',
                    line: index
                });

                if (oldTransactionType === newTransactionType && oldType === newType) {
                    if (!commons.makesure(newStartDate)) {
                        return false;
                    }
                    var newEntry = {
                        startDate: newStartDate,
                        endDate: newEndDate
                    };
                    var oldEntry = {
                        startDate: currRecord.getSublistValue({
                            sublistId: context.sublistId,
                            fieldId: 'custrecord_start_date',
                            line: index
                        }),
                        endDate: currRecord.getSublistValue({
                            sublistId: context.sublistId,
                            fieldId: 'custrecord_end_date',
                            line: index
                        })
                    };
                    var valid = voucherManageHelper.isEntryValid(newEntry, oldEntry);

                    if (valid) {
                        continue;
                    } else {
                        dialog.alert({
                            title: error.Message.Alert,
                            message: error.Message.InvalidPeriod
                        });
                        return valid;
                    }
                }
            }
        }
        return true;
    }

    function validateDelete(context) {
        var currRecord = context.currentRecord;
        var internalId = currRecord.getCurrentSublistValue({
            sublistId: context.sublistId,
            fieldId: 'custrecord_id_hidden'
        });
        if (commons.makesure(internalId)) {
            dialog.alert({
                title: error.Message.Alert,
                message: error.Message.InvaildDelete
            });
            return false;
        }
        return true;
    }

    return {
        cancelChange: cancelChange,
        fieldChanged: fieldChanged,
        lineInit: lineInit,
        validateLine: validateLine,
        validateDelete: validateDelete
    };

});
