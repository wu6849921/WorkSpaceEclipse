/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/wrapper/ns_wrapper_url',
    'N/currentRecord',
    '../../lib/wrapper/ns_wrapper_dialog',
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../lib/wrapper/ns_wrapper_format',
    '../../lib/commons',
    '../../app/vat/app_cn_vat_trans_validation',
    '../../lib/wrapper/ns_wrapper_https',
    'N/ui/message',
    '../../lib/util',
    '../../lib/wrapper/ns_wrapper_error'

], function(url, currentRecord, dialog, runtime, format, commons, transValidation, https, message, util, error) {
    /**
     * get query params
     */
    function getQueryParam() {
        var record = currentRecord.get();
        var subsidiaryId;
        if (runtime.isOW()) {
            subsidiaryId = record.getValue({
                fieldId: 'custpage_subsidiary'
            });
        } else {
            subsidiaryId = -1;
        }
        var invoiceType = record.getValue({
            fieldId: 'custpage_vatinvoicetype'
        });

        var customer = record.getValue({
            fieldId: 'custpage_customer'
        });
        var customerList = [];
        if (commons.makesure(customer)) {
            customerList = customer;
        }
        var salesList = record.getValue({
            fieldId: 'custpage_saleslist'
        });

        var dateFrom = record.getText({
            fieldId: 'custpage_datefrom'
        });
        if (dateFrom === '') {
            return false;
        }
        var dateTo = record.getText({
            fieldId: 'custpage_dateto'
        });
        if (dateTo === '') {
            return false;
        }

        var docNumberFrom = record.getValue({
            fieldId: 'custpage_documentnumberfrom'
        });
        var docNumberTo = record.getValue({
            fieldId: 'custpage_documentnumberto'
        });

        var transactionType = record.getValue({
            fieldId: 'custpage_transactiontype'
        });
        var transTypes;
        if (transactionType.length === 1 && transactionType[0] === '') {
            transTypes = [
                'CustInvc',
                'CashSale',
                'CustCred',
                'CashRfnd'
            ];
        } else {
            transTypes = transactionType;
        }
        var cacheInfor = JSON.parse(record.getValue({
            fieldId: 'custpage_cachefield'
        }));

        return {
            subsidiaryId: subsidiaryId,
            invoiceType: invoiceType,
            orginalCustomerIds: customer.join(','),
            customerIds: customerList.join(','),
            startDate: dateFrom,
            endDate: dateTo,
            minDocNo: docNumberFrom,
            maxDocNo: docNumberTo,
            orginalTransTypes: transactionType.join(','),
            transTypes: transTypes.join(','),
            cacheKey: cacheInfor.cacheKey,
            errorMsg: cacheInfor.errorMsg,
            messageInfor: cacheInfor.messageInfor,
            dataLength: cacheInfor.dataLength,
            cnCountry: cacheInfor.cnCountry,
            refreshTime: cacheInfor.refreshTime,
            salesList: salesList
        //multiLangMsg : JSON.parse(multiLangMsg)
        };
    }

    function refreshVATForm() {
        try {
            doRefreshVATForm();
        } catch (e) {
            handleError(e);
        } finally {
            enableButtons();
        }
    }

    function handleError(e) {
        util.writeDocument(e.message || e);
    }

    function handleResponse(reportResp) {
        if (commons.toNumber(reportResp.code) >= 400) {
            var errorCodeMessage = error.parseErrorResponse(reportResp.body);
            throw createError(errorCodeMessage.errorCode, errorCodeMessage.message);
        }
        try {
            var body = JSON.parse(reportResp.body);
        } catch (e) {
            throw createError(error.UnexpectedError, reportResp.body);
        }
        return body;
    }

    function createError(name, msg) {
        name = error.UnexpectedError;

        return error.create({
            name: name,
            message: msg
        });
    }

    function doRefreshVATForm() {
        // can't refresh again.
        disableButtons();
        var seletedParams = getQueryParam();
        seletedParams.format = 'txt';
        seletedParams.refreshTime = '' + new Date();

        if (format.parseDate(seletedParams.startDate) > format.parseDate(seletedParams.endDate)) {
            dialog.alert({
                title: seletedParams.messageInfor.errorMessage.Error,
                message: seletedParams.messageInfor.errorMessage.invalidDate
            });
            return;
        }

        var msg = message.create({
            title: seletedParams.messageInfor.errorMessage.loading,
            type: message.Type.CONFIRMATION,
            message: ''
        });
        msg.show();

        var suiteletUrlForGetInoviceData = exportSuiteletUrl(seletedParams);

        var response = https.get({
            url: suiteletUrlForGetInoviceData
        });

        seletedParams.format = 'preview';
        seletedParams.preview = true;
        var dataObj = handleResponse(response);
        seletedParams.cacheKey = dataObj.cacheKey;
        var suiteletUrlForPreview = exportSuiteletUrl(seletedParams);
        setWindowChanged(window, false);
        window.location = suiteletUrlForPreview;

    }

    function exportSuiteletUrl(seletedParams) {
        return url.resolveScript({
            scriptId: 'customscript_sl_cn_vat',
            deploymentId: 'customdeploy_sl_cn_vat',
            params: seletedParams
        });
    }

    function exportTxtFile() {
        try {
            var seletedParams = getQueryParam();
            var refreshTime = new Date(seletedParams.refreshTime);
            var expTime = new Date();
            var diffMin = (expTime - refreshTime) / (1000 * 60);

            if (diffMin > 20 && seletedParams.dataLength > 50) {
                dialog.alert({
                    title: seletedParams.messageInfor.errorMessage.Error,
                    message: seletedParams.messageInfor.errorMessage.pageTimeout
                });
                return;
            }
            doExportTxtFile(seletedParams);
        } catch (e) {
            handleError(e);
        }
    }

    function doExportTxtFile(seletedParams) {
        seletedParams.format = 'export';
        var httpsResp = https.get(exportSuiteletUrl(seletedParams));

        try {
            var respObj = commons.isString(httpsResp.body) ? JSON.parse(httpsResp.body) : httpsResp.body;

            if (respObj.type === 'error.SuiteScriptError' && respObj.name === 'warning') {
                dialog.confirm({
                    title: seletedParams.messageInfor.warningMessage.warning,
                    message: generateWarningMessage(JSON.parse(respObj.message), seletedParams),
                }).then(resolveWarning);
            } else if (respObj.type === 'file') {
                util.popupFileDownloadDialog(respObj.url + '&_xd=T');
            }
        } catch (ex) {
            //if parse error will directly write page
            util.writeDocument(httpsResp.body);
        }

    }

    function resolveWarning(result) {
        if (!result) {//user click cancel
            return;
        }
        var seletedParams = getQueryParam();
        //if click ok to confirm export file, sl will ignore warning and do not validate field length
        seletedParams.ignoreWarning = true;
        doExportTxtFile(seletedParams);

    }

    function generateWarningMessage(errorFields, seletedParams) {
        var message = '';
        var fieldMsgLabel = seletedParams.messageInfor.warningMessage.lengthExceed;
        var lastLineLabel = seletedParams.messageInfor.warningMessage.okOrCancel;

        for (var i = 0; i < errorFields.length; i++) {
            var field = errorFields[i];
            message = message + fieldMsgLabel.replace('{fieldname}', '{' + field.fieldname + '}').replace('{length}', field.limit) + '<br/>';
        }
        message = message + '<br/>' + lastLineLabel;
        return message;
    }

    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        var seletedParams = getQueryParam();
        if (seletedParams.subsidiaryId === -1) {
            if (seletedParams.cnCountry === false) {
                dialog.alert({
                    title: seletedParams.messageInfor.errorMessage.Error,
                    message: seletedParams.messageInfor.errorMessage.noChinaSubsidiarySI
                });
            }
        } else {
            if (!commons.makesure(seletedParams.subsidiaryId)) {
                dialog.alert({
                    title: seletedParams.messageInfor.errorMessage.Error,
                    message: seletedParams.messageInfor.errorMessage.noChinaSubsidiary
                });

            }
        }

        var errorMsg = seletedParams.errorMsg;
        if (commons.makesure(errorMsg)) {

            dialog.alert({
                title: seletedParams.messageInfor.errorMessage.Error,
                message: errorMsg
            });
        }

    }


    function importTxtFile() {
        var suiteletImportTxt = url.resolveScript({
            scriptId: 'customscript_sl_cn_vat_import',
            deploymentId: 'customdeploy_sl_cn_vat_import',
        });
        setWindowChanged(window, false);
        window.location = suiteletImportTxt;
    }

    function edit() {
        var record = currentRecord.get();
        var cacheInfor = JSON.parse(record.getValue({
            fieldId: 'custpage_cachefield'
        }));
        if (!cacheInfor.existEditableData) {
            dialog.alert({
                title: cacheInfor.messageInfor.errorMessage.Error,
                message: cacheInfor.messageInfor.errorMessage.noEditableData
            });
            return;
        }

        var suiteletImportTxt = url.resolveScript({
            scriptId: 'customscript_sl_cn_vat_edit',
            deploymentId: 'customdeploy_sl_cn_vat_edit',
            params: getQueryParam()
        });
        setWindowChanged(window, false);
        window.location = suiteletImportTxt;
    }

    function form(aform) {
        return currentRecord.get();
    }

    function disableButtons() {
        form().getField({
            fieldId: 'custpage_refresh'
        }).isDisabled = true;
    }

    function enableButtons() {
        form().getField({
            fieldId: 'custpage_refresh'
        }).isDisabled = false;
    }

    return {
        pageInit: pageInit,
        refreshVATForm: refreshVATForm,
        exportTxtFile: exportTxtFile,
        importTxtFile: importTxtFile,
        edit: edit
    };

});
