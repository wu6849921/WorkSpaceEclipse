/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    './app_cn_atbl_form',
    '../../lib/commons',
    './app_cn_atbl_report_handler',
    '../../lib/wrapper/ns_wrapper_render',
    '../../templates/templatesloader',
    '../../res/atbl/atblresource',
    'N/file'

],

function(forms,commons,reportHandler,render,templatesloader,resource,file){
    var fileResource;
    function fileRelatedResource() {
        if (!commons.makesure(fileResource)) {
            fileResource = resource.load(resource.Name.File);
        }
        return fileResource;
    }

    function handleAsPage(filter) {
        if (commons.makesure(filter)) {
            forms.setUserData(filter);
            forms.setSublistContents(reportHandler.getReportData(filter, arguments[1]));
            forms.setTemplateContents(arguments[1]);
        }
        return forms.renderAsPage();
    }
    function handleAsPDF(filter) {
        forms.setUserData(filter);
        render.setTemplateContents(templatesloader.load('templates_cn_atbl_PDF.ftl'));
        render.addCustomDataSource('data', render.DataSource.OBJECT, reportHandler.getReportData(filter, arguments[1]));
        var pdfFile = render.renderAsPdf();
        pdfFile.name = fileRelatedResource().ExportFileName + '.pdf';
        return pdfFile;
    }
    function handleAsExcel(filter) {
        forms.setUserData(filter);
        render.setTemplateContents(templatesloader.load('templates_cn_atbl_Excel.ftl'));
        render.addCustomDataSource('data', render.DataSource.OBJECT, reportHandler.getReportData(filter, arguments[1]));
        var excelFileName = fileRelatedResource().ExportFileName + '.xls';
        var excelFile = file.create({
            name: excelFileName,
            fileType: file.Type.PLAINTEXT,
            contents: render.renderAsString()
        });

        return excelFile;
    }
    return {
        handleAsPage: handleAsPage,
        handleAsExcel: handleAsExcel,
        handleAsPDF: handleAsPDF
    };

});