/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope Public
 */
define([
    'N/search',
    'N/ui/serverWidget',
    'N/record',
    '../../lib/commons',
    '../../app/vat/app_cn_vat_label_parser',
    '../../dao/cn_vat_dao',
    '../../res/vat/vatresource-client',
    '../../app/vat/app_cn_vat_status'
],
 
function(search, serverWidget, record, commons, labelParser, vatDao, resource, statusHandler) {

    var message = resource.load(resource.Name.Errors);

    /*
     * get tab id by label
     * 
     * */
    function getTabId(form, label) {
        var tabs = form.getTabs();
        var tempTab;
        for ( var i in tabs) {
            tempTab = form.getTab({
                id: tabs[i]
            });
            if (tempTab.label !== null && tempTab.label.indexOf(label) >= 0) {
                return tabs[i];
            }
        }
 
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {
        if (scriptContext.type === scriptContext.UserEventType.EDIT) {
            if (isConsolidatedTran(scriptContext.newRecord.id)) {
                throw message.EditConsolidatedTran;
            }
        }

        var transactionType = scriptContext.newRecord.getValue({
            fieldId: 'type'
        });
        var createdfrom = scriptContext.newRecord.getValue({
            fieldId: 'createdfrom'
        });
        if (transactionType !== 'custinvc' && transactionType !== 'cashsale' && transactionType !== 'custcred' && transactionType !== 'cashrfnd') {
            scriptContext.form.getField({
                id: 'custbody_cn_vat_invoice_type'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
 
            scriptContext.form.getField({
                id: 'custbody_cn_vat_split_rule'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
 
        }
        log.debug('createdfrom', createdfrom);
        if (transactionType !== 'cashrfnd' || commons.makecertain(createdfrom)) {
 
            scriptContext.form.getField({
                id: 'custbody_cn_vat_createdfrom'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
        }
        if (transactionType !== 'custcred' && transactionType !== 'cashrfnd') {
 
            scriptContext.form.getField({
                id: 'custbody_cn_info_sheet_number'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
        }
        if (transactionType === 'custinvc' || transactionType === 'cashsale' || transactionType === 'custcred' || transactionType === 'cashrfnd') {
            labelParser.refreshResourceFile();
            var labels = labelParser.loadResourceFile();
 
            var cacheField = scriptContext.form.addField({
                id: 'custpage_cachefield',
                label: 'cacheInfo',
                type: serverWidget.FieldType.LONGTEXT,
                container: getTabId(scriptContext.form, labels.fieldLabel.tabLabel)
            });
            cacheField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            cacheField.defaultValue = JSON.stringify(labels);
 
            var sublist = scriptContext.form.addSublist({
                id: 'custpage_cn_vat_invoices',
                tab: getTabId(scriptContext.form, labels.fieldLabel.tabLabel),
                type: serverWidget.SublistType.STATICLIST,
                label: labels.fieldLabel.sublistLabel
            });
            var statusField = sublist.addField({
                id: 'custpage_cn_vat_status',
                type: serverWidget.FieldType.SELECT,
                label: labels.fieldLabel.vatStatus,
                source: 'customlist_cn_vat_status'
 
            });
            //when the field type is select, the field can edit when view or edit, no matter what the sublist type.
            //so must disable this field manually.
            statusField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });
 
            sublist.addField({
                id: 'custpage_cn_vat_invoice_code',
                type: serverWidget.FieldType.TEXT,
                label: labels.fieldLabel.vatInvoiceCode
            });
 
            sublist.addField({
                id: 'custpage_cn_vat_invoice_number',
                type: serverWidget.FieldType.TEXT,
                label: labels.fieldLabel.vatInvoiceNum
            });
 
            sublist.addField({
                id: 'custpage_cn_vat_invoice_date',
                type: serverWidget.FieldType.TEXT,
                label: labels.fieldLabel.vatInvoiceDate
            });
 
            sublist.addField({
                id: 'custpage_cn_vat_invoice_tax_amount',
                type: serverWidget.FieldType.TEXT,
                label: labels.fieldLabel.vatInvoiceTaxAmount
            });
 
            sublist.addField({
                id: 'custpage_cn_vat_invoice_tax_excl_amnt',
                type: serverWidget.FieldType.TEXT,
                label: labels.fieldLabel.vatInvoiceTaxExclusiveAmount
            });
 
            var currentRecord = scriptContext.newRecord;
 
            var recordId = currentRecord.id;
            if (commons.makesure(recordId)) {
                var recordIds = [];
 
                recordIds.push(recordId);
 
                var results = vatDao.getVATByRecId(recordIds); // Need Custom Records -> China VAT Invoices (View) permission
 
                for (var i = 0; i < results.length; i++) {
                    var line = results[i];
 
                    var columns = line.columns;
                    if (commons.makesure(line.getValue(columns[0]))) {
                        sublist.setSublistValue({
                            id: 'custpage_cn_vat_status',
                            line: i,
                            value: line.getValue(columns[0])
                        });
                    }
                    if (statusHandler.isConsolidated(line)) {
                        //Hide  the value of other column when status is consolidated
                        continue;
                    }
                    if (commons.makesure(line.getValue(columns[1]))) {
                        sublist.setSublistValue({
                            id: 'custpage_cn_vat_invoice_code',
                            line: i,
                            value: line.getValue(columns[1])
                        });
                    }
                    if (commons.makesure(line.getValue(columns[2]))) {
                        sublist.setSublistValue({
                            id: 'custpage_cn_vat_invoice_number',
                            line: i,
                            value: line.getValue(columns[2])
                        });
                    }
                    if (commons.makesure(line.getValue(columns[3]))) {
                        sublist.setSublistValue({
                            id: 'custpage_cn_vat_invoice_date',
                            line: i,
                            value: line.getValue(columns[3])
                        });
                    }
                    if (commons.makesure(line.getValue(columns[4]))) {
                        sublist.setSublistValue({
                            id: 'custpage_cn_vat_invoice_tax_amount',
                            line: i,
                            value: line.getValue(columns[4])
                        });
                    }
                    if (commons.makesure(line.getValue(columns[5]))) {
                        sublist.setSublistValue({
                            id: 'custpage_cn_vat_invoice_tax_excl_amnt',
                            line: i,
                            value: line.getValue(columns[5])
                        });
                    }
                }
 
            }
        }
    }

    function isConsolidatedTran(internalId) {
        if (commons.ensure(internalId)) {
            var vatInvoices = vatDao.getVATByRecId([internalId]); // Need Custom Records -> China VAT Invoices (View) permission
            for (var i = 0; i < vatInvoices.length; i++) {
                if (statusHandler.isConsolidated(vatInvoices[i])) {
                    return true;
                }
            }
        }
        return false;
    }
 
    return {
        beforeLoad: beforeLoad
    };
 
});

