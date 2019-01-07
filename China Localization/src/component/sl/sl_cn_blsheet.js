/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define([
    '../../app/balance_sheet/app_cn_blsheet_form',
    '../../lib/commons'
],

function(blsheetForm, commons) {

    /**
     * @desc Definition of the Suitelet script trigger point.
     * @param {Object} context.
     * @param {ServerRequest} context.request - Encapsulation of the incoming request.
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response.
     * @Since 2015.2
     */
    function onRequest(context) {
        var request = context.request;
        var response = context.response;
        var param = {};
        param.type = request.parameters.type;
        if (param.type === 'pdf') {
            response.write(blsheetForm.createPDFReport(request.body));
            return;
        }
        param.reportName = request.parameters.reportName;
        param.reportNameId = request.parameters.reportNameId;
        param.reportId = request.parameters.reportId;
        param.periodId = request.parameters.periodId;
        param.bookId = request.parameters.bookId;
        param.subsidiaryId = request.parameters.subsidiaryId;
        param.unit = request.parameters.unit;
        param.reportDataId = request.parameters.reportDataId;
        param.locationId = commons.makesure(request.parameters.locationId) ? request.parameters.locationId : null;
        param.departmentId = commons.makesure(request.parameters.departmentId) ? request.parameters.departmentId : null;
        param.classId = commons.makesure(request.parameters.classId) ? request.parameters.classId : null;

        log.debug({
            title: 'reportDataId',
            details: param.reportDataId
        });
        if (param.reportId !== '' && param.reportId !== null && param.reportId !== undefined) {
            param.showReport = true;
        } else {
            param.showReport = false;
        }


        param.lang = request.lang != null ? request.parameters.lang : 1;
        log.debug({
            title: 'CN Balance Sheet',
            details: 'reportName' + param.reportName + 'periodId:' + param.periodId + '; subsidiary: ' + param.subsidiaryId + '; unit: ' + param.unit + '; lang: ' + param.lang + 'report data' + param.reportData
        });
        var form = blsheetForm.createForm(param);

        response.writePage({
            pageObject: form
        });
    }

    return {
        onRequest: onRequest
    };

});
