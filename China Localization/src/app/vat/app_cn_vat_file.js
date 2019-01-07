/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/wrapper/ns_wrapper_file',
    '../../lib/wrapper/ns_wrapper_format',
    '../../lib/wrapper/ns_wrapper_render',
    './app_cn_vat_template',
    '../../lib/commons'
],

function(file, format, render, template, commons) {

    function generateTxtFile(dataObj) {
        return saveAndLoadFile(createFile(dataObj));
    }

    function createFile(dataObj) {
        var fileContents = getInvoiceContents(dataObj);
        if (!commons.ensure(fileContents)) {
            return null;
        }
        var folderId = getFolderId();
        if (!commons.ensure(folderId)) {
            return null;
        }
        return file.create({
            name: getFileName(),
            folder: folderId,
            fileType: file.Type.PLAINTEXT,
            encoding: file.Encoding.GB2312,
            isOnline: true,
            contents: fileContents
        });

    }

    function saveAndLoadFile(fileObj) {
        if (!commons.ensure(fileObj)) {
            return null;
        }
        var fileId = fileObj.save();

        if (!commons.ensure(fileId)) {
            return null;
        }
        var generatedTXT = file.load({
            id: fileId
        });
        return generatedTXT;
    }


    function getFolderId() {
        var placeHolderFile = file.load({
            path: 'reports/vat/readme.md'
        });
        return placeHolderFile.folder;
    }

    function getInvoiceContents(dataObj) {

        if (dataObj === null)
            return null;
        filterErrorInvoices(dataObj);
        render.setTemplateContents(getTemplateContent());

        var vatFormattedData = getFormattedData(dataObj);
        render.addCustomDataSource('datasource', render.DataSource.OBJECT, vatFormattedData);
        var contentStr = render.renderAsString();
        log.debug('app_cn_vat_file.js: getInvoiceContents', 'file contents' + contentStr);
        contentStr = contentStr.replace(/[~]+\r\n/g, "\r\n");
        log.debug('app_cn_vat_file.js: getInvoiceContents', 'file contents after replace ~' + contentStr);
        return contentStr;
    }


    /**
     * filter error invoices
     * */
    function filterErrorInvoices(dataObj) {
        var invoices = dataObj.invoices;
        var newInvoices = [];
        for (var i = 0; i < invoices.length; i++) {
            if (!commons.makesure(invoices[i].errMsg)) {
                newInvoices.push(invoices[i]);
            }
        }
        dataObj.invoices = newInvoices;
    }

    function getFileName() {
        var fileName = format.formatFileName({
            prefix: "",
            suffix: ".txt"
        })
        log.debug('app_cn_vat_file.js: getFileName', 'fileName is ' + fileName);
        return fileName;

    }


    function getTemplateContent() {
        return template.getTemplate("China VAT Export");
    }

    function getFormattedData(dataObj) {

        var invoices = dataObj.invoices;

        //0.17 -> .17
        for ( var i in invoices) {
            invoices[i].internalid = id(invoices[i]);
            var items = dataObj.invoices[i].items;
            for ( var j in items) {
                var taxrate = items[j].taxrate;
                if (taxrate == null || taxrate <= 0 || taxrate > 1)
                    continue;

                var taxrateStr = '' + taxrate;
                items[j].taxrate = '.' + taxrateStr.split('.')[1];
            }
        }

        return dataObj;
    }

    function id(invoice) {
        return commons.makesure(invoice.rawtraninternalid) ? invoice.rawtraninternalid : invoice.internalid;
    }

    return {
        generateTxtFile: generateTxtFile,
        getInvoiceContents: getInvoiceContents
    };

});
