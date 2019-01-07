/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NScriptType ScheduledScript
 * @NScriptName CN SS Voucher Print
 * @NScriptId _ss_cn_voucher_print
 * @NModuleScope TargetAccount
 */
define([
    '../../app/voucher/app_cn_voucher_handler',
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../lib/commons',
    '../../lib/wrapper/ns_wrapper_file',
    '../../lib/wrapper/ns_wrapper_email',
    '../../lib/wrapper/ns_wrapper_format',
    '../../res/voucherresource'
],

function(voucherHandler, runtime, commons, fileHandler, email, format, resource) {

    function execute(context) {
        if (context.type !== context.InvocationType.ON_DEMAND)
            return;

        var filter = runtime.getCurrentScript().getParameter('custscript_search_filter');
        var filterObject = JSON.parse(filter);
        if (commons.ensure(context.utTestFilters)) {//this is just a workround for unit test
            filterObject = context.utTestFilters;
        }
        var pdf = voucherHandler.generatePDFFile(filterObject);
        var savedPdf = saveFile(pdf);
        sendEmailNotification(savedPdf);
    }

    function saveFile(file) {
        var savingStartTime = runtime.clock();
        log.audit('start saving PDF...', savingStartTime);

        var referenceFolderId = getFolderId();
        if (commons.ensure(referenceFolderId)) {
            file.folder = referenceFolderId;
            file.isOnline = true;
            var fileId = file.save();

            if (commons.ensure(fileId)) {
                var generatedPDF = fileHandler.load({
                    id: fileId
                });
                log.audit('Time spent (ms) on Saving PDF', runtime.clock() - savingStartTime);
                return generatedPDF;
            }
        }
    }

    function getFolderId() {
        var placeHolderFile = fileHandler.load({
            path: 'reports/voucher/readme.md'
        });
        return placeHolderFile.folder;
    }

    function sendEmailNotification(file) {
        var emailMessages = resource.load(resource.Name.Email);
        var user = runtime.getCurrentUser();

        var emailSubject;
        var emailContent;

        if (commons.ensure(file)) {
            emailSubject = emailMessages.VOUCHER_REPORT_SUCCESS;
            emailContent = emailMessages.VOUCHER_REPORT_SUCCESS_MESSAGE;
        } else {
            emailSubject = emailMessages.VOUCHER_REPORT_FAILURE;
            emailContent = emailMessages.VOUCHER_REPORT_FAILURE_MESSAGE;
        }

        var emailBody = [
            emailMessages.ACCOUNT,
            ": ",
            runtime.accountId,
            "<br>",
            emailMessages.ENVIRONMENT,
            ": ",
            runtime.envType,
            "<br>",
            emailMessages.DATE_TIME,
            ": ",
            format.formatDateTime(new Date()),
            "<br>",
            emailMessages.USERNAME,
            ": ",
            runtime.getCurrentUser().email,
            "<br>",
            emailContent,
            "<a href='",
            file.url,
            "'>",
            file.name,
            "</a>"
        ].join("");

        email.send({
            author: user.id,
            recipients: user.email,
            subject: emailSubject,
            body: emailBody,
        });
    }

    return {
        execute: execute
    };

});
