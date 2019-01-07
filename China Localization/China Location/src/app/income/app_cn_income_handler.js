/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */

define([
    './app_cn_income_form',
    '../../lib/commons',
    '../../templates/templatesloader',
    '../../lib/wrapper/ns_wrapper_render',
    './app_cn_income_report_handler',
    '../../res/income/incomeresource',
    'N/file'
],

function(forms, commons, templatesloader, render, reportHandler, resource, file) {
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
            render.setTemplateContents(templatesloader.load('templates_cn_income_HTML.ftl'));
            render.addCustomDataSource('data', render.DataSource.OBJECT, reportHandler.getReportData(filter, arguments[1]));
            forms.setTemplateContents(render.renderAsString(), arguments[1]);
        }
        return forms.renderAsPage();
    }

    function handleAsPDF(filter) {
        render.setTemplateContents(templatesloader.load('templates_cn_income_PDF.ftl'));
        render.addCustomDataSource('data', render.DataSource.OBJECT, reportHandler.getReportData(filter, arguments[1]));
        var pdfFile = render.renderAsPdf();
        pdfFile.name = fileRelatedResource().ExportFileName + '.pdf';
        return pdfFile;
    }

    function handleAsExcel(filter) {
        forms.setUserData(filter);
        render.setTemplateContents(templatesloader.load('templates_cn_income_Excel.ftl'));
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
        handleAsPDF: handleAsPDF,
        handleAsExcel: handleAsExcel
    };

});
