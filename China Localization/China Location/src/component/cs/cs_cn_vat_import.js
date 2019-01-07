/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/wrapper/ns_wrapper_url',
    'N/currentRecord',
    '../../lib/wrapper/ns_wrapper_https',
    '../../lib/wrapper/ns_wrapper_dialog',
    '../../lib/commons',
    'N/ui/message',
],

function(url, currentRecord, https, dialog, commons, message) {

    function getQueryParam() {
        var record = currentRecord.get();
        var cacheInfor = record.getValue({
            fieldId: 'cn_vat_import_message'
        });

        var messageInfo = cacheInfor;
        var fileObj = record.getValue({
            fieldId: 'custpage_file_browser'
        });

        var multiLangMsg = record.getValue({
            fieldId: 'cn_vat_multilang_bundle'
        });

        var fileName = fileObj.split(".");
        var length = fileName.length;
        var extension = fileName[length - 1];
        return {
            messageInfo: messageInfo,
            extension: extension,
            multiLangMsg: JSON.parse(multiLangMsg)
        };
    }


    function pageInit(context) {
        var currentRecord = context.currentRecord;
        var messageInfo = currentRecord.getValue({
            fieldId: 'cn_vat_import_message'
        });
        if (messageInfo !== undefined && messageInfo !== null && messageInfo.trim().length > 0) {
            var errormsg = message.create({
                title: "",
                type: message.Type.INFORMATION,
                message: messageInfo
            });
            errormsg.show();
        }
    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    //    Here may need pre-submission validation
    function saveRecord(context) {
        var currentRecord = context.currentRecord;
        var fileIdentifier = currentRecord.getValue({
            fieldId: 'custpage_file_browser'
        });
        if (!fileIdentifier) {
            dialog.alert({
                title: getQueryParam().multiLangMsg.Error,
                message: getQueryParam().multiLangMsg.noFileSelected
            });
            return false;
        }

        var fileNameArray = fileIdentifier.split(".");
        var extension = fileNameArray[fileNameArray.length - 1];
        if (extension.toLowerCase() !== "txt") {
            dialog.alert({
                title: getQueryParam().multiLangMsg.Error,
                message: getQueryParam().multiLangMsg.fileNotTxt
            });
            return false;
        }

        return true;
    }

    function backToGenerate() {
        var suiteletBackToGenerate = url.resolveScript({
            scriptId: 'customscript_sl_cn_vat',
            deploymentId: 'customdeploy_sl_cn_vat',
        });
        setWindowChanged(window, false);
        window.location = suiteletBackToGenerate;
    }

    return {
        pageInit: pageInit,
        saveRecord: saveRecord,
        backToGenerate: backToGenerate
    };
});
