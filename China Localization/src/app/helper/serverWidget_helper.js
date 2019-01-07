/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */

define([
    '../../lib/commons'
],

function(commons) {

    function addField(options) {
        if (commons.makesure(options)) {
            this.field = this.form.addField(options);
        }
        return this;
    }

    function addSublist(options) {
        if (commons.makesure(options)) {
            this.sublist = this.form.addSublist(options);
        }
        return this;
    }

    function addButton(options) {
        if (commons.makesure(options)) {
            this.button = this.form.addButton(options);
        }
        return this;
    }

    function addSubmitButton(options) {
        if (commons.makesure(options)) {
            this.button = this.form.addSubmitButton(options);
        }
        return this;
    }

    function addSelectOptions(options) {
        if (commons.makesure(options)) {
            for ( var i in options) {
                this.field.addSelectOption({
                    value: options[i].value,
                    text: options[i].text,
                    isSelected: this.defaultValue === options[i].value
                });
            }
        }
        return this;
    }

    function addFieldGroup(options) {
        if (commons.makesure(options)) {
            this.fieldGroup = this.form.addFieldGroup(options);
        }
        return this;
    }

    function setDefaultValue(value) {
        if (commons.makesure(value)) {
            this.defaultValue = value;
            this.field.defaultValue = value;
        }
        return this;
    }
    
    function setHelpText(help) {
        if (commons.makesure(help)) {
            this.field.setHelpText({
                help: help
            });
        }
        return this;
    }

    function setPadding(value) {
        if (commons.makesure(value)) {
            this.field.padding = value;
        }
        return this;
    }

    function setButtonDisabled(value) {
        this.button.isDisabled = value;
        return this;
    }

    function updateLayoutType(type) {
        if (commons.makesure(type)) {
            this.field.updateLayoutType({
                layoutType: type
            });
        }
        return this;
    }

    function updateDisplayType(type) {
        if (commons.makesure(type)) {
            this.field.updateDisplayType({
                displayType: type
            });
        }

        return this;
    }

    function setMandatory(value) {
        if (commons.makesure(value)) {
            this.field.isMandatory = value;
        }
        return this;
    }

    function setBorderHidden(value) {
        if (commons.makesure(value)) {
            this.fieldGroup.isBorderHidden = value;
        }
        return this;
    }

    function setSingleColumn(value) {
        if (commons.makesure(value)) {
            this.fieldGroup.isSingleColumn = value;
        }
        return this;
    }

    function updateDisplaySize(height, width) {
        if (commons.makesure(height) && commons.makesure(width)) {
            this.field.updateDisplaySize({
                height: height,
                width: width
            });
        }
        return this;
    }

    function getSelectOptions() {
        return this.field.getSelectOptions();
    }

    /**
     * E.g. helper.form(form).embedJavaScript('https://url/to/javascript/file.js');
     * @param {String} fileUrl The URL of file to embed
     * @returns {serverWidget.Form} The form
     */
    function embedJavaScript(fileUrl) {
        if (commons.makesure(fileUrl)) {
            var serverWidget = require('N/ui/serverWidget');
            if (!commons.makesure(this.field)) {
                this.addField({
                    id: 'custpage_default_inline_js_field',
                    label: 'Default Inline JavaScript Field',
                    type: serverWidget.FieldType.INLINEHTML
                });
            }
            this.setDefaultValue('<script type=\'text/javascript\' src="' + fileUrl + '\"></script>');
        }
        return this;
    }

    function clearSublist(sublistId) {
        if (commons.makesure(sublistId)) {
            var lineCount = this.form.getLineCount({
                sublistId: sublistId
            });
            for (var i = 0; i < lineCount; i++) {
                this.form.removeLine({
                    sublistId: sublistId,
                    line: 0,
                    ignoreRecalc: true
                });
            }
        }
        return this;
    }

    function setFocus(sublistId, line) {
        this.form.selectLine({
            sublistId: sublistId,
            line: line
        });
        return this;
    }

    function moveLine(params) {
        this.form.insertLine({
            sublistId: params.sublistId,
            line: params.to
        });
        for ( var i in params.fieldIds) {
            if (commons.ensure(params.fieldValue)) {
                var fieldValue = params.fieldValue(this.form, params.from + 1, params.fieldIds[i]);
            } else {
                fieldValue = this.form.getSublistValue({
                    sublistId: params.sublistId,
                    fieldId: params.fieldIds[i],
                    line: params.from + 1
                });
            }
            this.form.setCurrentSublistValue({
                sublistId: params.sublistId,
                fieldId: params.fieldIds[i],
                value: fieldValue
            });
        }
        this.form.commitLine({
            sublistId: params.sublistId
        });
        this.form.removeLine({
            sublistId: params.sublistId,
            line: params.from + 1
        });
    }

    function form(form) {
        return {
            form: form,
            addField: addField,
            addSublist: addSublist,
            addButton: addButton,
            addSubmitButton: addSubmitButton,
            addSelectOptions: addSelectOptions,
            addFieldGroup: addFieldGroup,
            setDefaultValue: setDefaultValue,
            setButtonDisabled: setButtonDisabled,
            updateLayoutType: updateLayoutType,
            updateDisplayType: updateDisplayType,
            setMandatory: setMandatory,
            setBorderHidden: setBorderHidden,
            setSingleColumn: setSingleColumn,
            updateDisplaySize: updateDisplaySize,
            embedJavaScript: embedJavaScript,
            clearSublist: clearSublist,
            setFocus: setFocus,
            moveLine: moveLine,
            getSelectOptions: getSelectOptions,
            setHelpText: setHelpText,
            setPadding: setPadding
        }
    }

    return {
        form: form
    };

});
