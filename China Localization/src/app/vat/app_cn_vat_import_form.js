/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/wrapper/ns_wrapper_file',
    '../../lib/wrapper/ns_wrapper_ui_serverWidget',
    './app_cn_vat_label_parser'
],

function(file, serverWidget, labelParser) {
    var _labels;
    function createForm(message) {
        labelParser.refreshResourceFile();
        _labels = labelParser.loadResourceFile();
        var form = serverWidget.createForm({
            title: _labels.fieldLabel.importtitle
        });

        form.clientScriptModulePath = '../../component/cs/cs_cn_vat_import.js';
        cacheInfo(form, message);
        createmultiLangField(form);
        createBrowserField(form);
        createSubmitField(form);
        createBackField(form);
        return form;
    }

    function cacheInfo(form, message) {
        var cacheField = form.addField({
            id: 'cn_vat_import_message',
            label: 'cacheInfo',
            type: serverWidget.FieldType.LONGTEXT
        });
        if (message) {
            cacheField.defaultValue = message;
        }
        cacheField.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });
    }

    function createmultiLangField(form) {
        var multiLangField = form.addField({
            id: 'cn_vat_multilang_bundle',
            label: 'Multi-Lang',
            type: serverWidget.FieldType.LONGTEXT
        });
        multiLangField.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });

        multiLangField.defaultValue = JSON.stringify(_labels.errorMessage);
    }

    function createBrowserField(form) {
        form.addField({
            id: 'custpage_file_browser',
            type: serverWidget.FieldType.FILE,
            label: _labels.fieldLabel.fileupload
        });
    }

    function createSubmitField(form) {
        form.addSubmitButton({
            label: _labels.fieldLabel.import,
            id: 'custpage_submit'
        });
    }

    function createBackField(form) {
        form.addButton({
            id: 'custpage_back',
            label: _labels.fieldLabel.back,
            functionName: 'backToGenerate'
        });
    }

    return {
        createForm: createForm
    };

});
