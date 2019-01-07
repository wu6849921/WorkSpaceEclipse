/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/wrapper/ns_wrapper_ui_serverWidget',
    '../../lib/wrapper/ns_wrapper_config',
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../lib/wrapper/ns_wrapper_record',
    '../../lib/commons',
    './app_cn_vat_label_parser',
    '../helper/serverWidget_helper',
    './app_cn_vat_data_sort'
],

function(serverWidget, config, runtime, record, commons, labelParser, helper, sorter) {
    var resourceLabels;
    var userData;
    var transactionData;

    function labels() {
        if (!commons.makesure(resourceLabels)) {
            resourceLabels = labelParser.loadResourceFile();
        }
        return resourceLabels;
    }

    function renderAsPage() {
        var form = createForm();
        addButtons(form);
        addSubtab(form);
        addSublist(form);
        addFilterHiddenField(form);
        addLocalStorageHiddenField(form);
        insertData(form);
        addMaxInvoiceAmountHiddenField(form);
        return form;
    }


    function createForm() {
        var form = serverWidget.createForm({
            title: labels().fieldLabel.editTitle
        });
        form.clientScriptModulePath = '../../component/cs/cs_cn_vat_edit.js';
        return form;
    }

    function addButtons(form) {
        helper.form(form).addButton({
            id: 'custpage_save',
            label: labels().fieldLabel.editSave,
            functionName: 'save'
        }).addButton({
            id: 'custpage_cancel',
            label: labels().fieldLabel.editCancel,
            functionName: 'cancel'
        });

    }

    function addSubtab(form) {
        form.addSubtab({
            id: 'custpage_transactions_header',
            label: labels().subtab.transactionsHeader
        });

        form.addTab({
            id: 'custpage_transactions_lines',
            label: labels().subtab.transactionsLines
        });
    }

    function addSublist(form) {
        addHeaderSublist(form);
        addLineSublist(form);
    }

    function addHeaderSublist(form) {
        var headerSublist = form.addSublist({
            id: 'custpage_header_sublist',
            type: serverWidget.SublistType.INLINEEDITOR,
            tab: 'custpage_transactions_header',
            label: labels().tableHeader.transactions
        });

        headerSublist.addButton({
            id: 'custpage_groupsameitems',
            label: ' '
        });

        headerSublist.addButton({
            id: 'merge',
            label: labels().button.merge,
            functionName: 'merge'
        });

        headerSublist.addButton({
            id: 'unmerge',
            label: labels().button.unmerge,
            functionName: 'unmerge'
        });

        headerSublist.addField({
            id: 'custpage_header_select',
            type: serverWidget.FieldType.CHECKBOX,
            label: labels().button.select
        });

        headerSublist.addField({
            id: 'custpage_internalid',
            type: serverWidget.FieldType.TEXT,
            label: labels().tableHeader.internalId
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        headerSublist.addField({
            id: 'custpage_customer',
            type: serverWidget.FieldType.TEXT,
            label: labels().tableHeader.customerName
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        headerSublist.addField({
            id: 'custpage_type',
            type: serverWidget.FieldType.TEXT,
            label: labels().tableHeader.type
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        headerSublist.addField({
            id: 'custpage_doc_number',
            type: serverWidget.FieldType.TEXT,
            label: labels().tableHeader.docNum
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        headerSublist.addField({
            id: 'custpage_status',
            type: serverWidget.FieldType.TEXT,
            label: labels().tableHeader.status
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        headerSublist.addField({
            id: 'custpage_doc_date',
            type: serverWidget.FieldType.TEXT,
            label: labels().tableHeader.docDate
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        headerSublist.addField({
            id: 'custpage_tax_excl_amount',
            type: serverWidget.FieldType.FLOAT,
            label: labels().tableHeader.taxExclusiveAmount
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        headerSublist.addField({
            id: 'custpage_amount_after_discount',
            type: serverWidget.FieldType.FLOAT,
            label: labels().tableHeader.amountAfterDiscount
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });
    }

    function addLineSublist(form) {
        var itemSublist = form.addSublist({
            id: 'custpage_item_sublist',
            type: serverWidget.SublistType.INLINEEDITOR,
            tab: 'custpage_transactions_lines',
            label: labels().itemHeader.items
        });

        itemSublist.addField({
            id: 'custpage_item_name',
            type: serverWidget.FieldType.TEXT,
            label: labels().itemHeader.itemName
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        itemSublist.addField({
            id: 'custpage_item_model',
            type: serverWidget.FieldType.TEXT,
            label: labels().itemHeader.model
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        itemSublist.addField({
            id: 'custpage_item_uom',
            type: serverWidget.FieldType.TEXT,
            label: labels().itemHeader.uom
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        itemSublist.addField({
            id: 'custpage_item_quantity',
            type: serverWidget.FieldType.FLOAT,
            label: labels().itemHeader.quantity
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        itemSublist.addField({
            id: 'custpage_unit_pirce',
            type: serverWidget.FieldType.FLOAT,
            label: labels().itemHeader.unitPrice
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        itemSublist.addField({
            id: 'custpage_item_tax_exclusive_amount',
            type: serverWidget.FieldType.FLOAT,
            label: labels().itemHeader.amount
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        itemSublist.addField({
            id: 'custpage_item_tax_rate',
            type: serverWidget.FieldType.FLOAT,
            label: labels().itemHeader.taxRate
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        itemSublist.addField({
            id: 'custpage_item_discount_amount',
            type: serverWidget.FieldType.FLOAT,
            label: labels().itemHeader.discountAmount
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });
    }

    function addFilterHiddenField(form) {
        helper.form(form).addField({
            id: 'custpage_userdata',
            type: serverWidget.FieldType.LONGTEXT,
            label: 'userData'
        }).updateDisplayType(serverWidget.FieldDisplayType.HIDDEN).setDefaultValue(JSON.stringify(userData));

    }

    function addLocalStorageHiddenField(form) {
        helper.form(form).addField({
            id: 'custpage_localstorage',
            type: serverWidget.FieldType.LONGTEXT,
            label: 'Local Storage'
        }).updateDisplayType(serverWidget.FieldDisplayType.HIDDEN);
    }

    function addMaxInvoiceAmountHiddenField(form) {
        helper.form(form).addField({
            id: 'custpage_maxinvoiceamount',
            type: serverWidget.FieldType.FLOAT,
            label: 'maxInvoiceAmount'
        }).updateDisplayType(serverWidget.FieldDisplayType.HIDDEN).setDefaultValue(getMaxInvoiceAmount());
    }

    function insertData(form) {
        var sortedInvoices = sortData();
        insertRows(form, sortedInvoices);
    }

    function sortData() {
        var invoices = sorter.keySort(transactionData.invoices, [
            'cusname', // chars type
            'status', // chars type, e.g. consolidated
            'type', // chars type, e.g. CustInvc
            'docno', // chars type, e.g. abc001
            'internalid' // numbers type
        ]);
        return invoices;
    }

    function insertRows(form, invoices) {
        var headerSublist = form.getSublist({
            id: 'custpage_header_sublist'
        });

        var lineNumber = 0;
        for (var i = 0; i < invoices.length; i++) {
            var invoice = invoices[i];
            if (invoice.editable) {
                insertRow(headerSublist, lineNumber, invoice);
                lineNumber++;
                //Append children under the parent row, For merged rows.
                if (commons.makesure(invoice.children)) {
                    for (var j = 0; j < invoice.children.length; j++) {
                        var child = invoice.children[j];
                        insertRow(headerSublist, lineNumber, child);
                        lineNumber++;
                    }
                }
            }
        }
    }

    function insertRow(headerSublist, lineNumber, row) {
        var internalId = id(row); // show IDENTITY in internalId field
        setSublistValue(headerSublist, 'custpage_internalid', lineNumber, internalId + '');
        setSublistValue(headerSublist, 'custpage_type', lineNumber, labels().tableHeader[row.type]);
        setSublistValue(headerSublist, 'custpage_status', lineNumber, labels().status[row.status]);
        setSublistValue(headerSublist, 'custpage_doc_number', lineNumber, row.docno);
        setSublistValue(headerSublist, 'custpage_doc_date', lineNumber, row.docdate);
        setSublistValue(headerSublist, 'custpage_customer', lineNumber, row.cusname);
        setSublistValue(headerSublist, 'custpage_tax_excl_amount', lineNumber, row.taxexclusiveamt);
        setSublistValue(headerSublist, 'custpage_amount_after_discount', lineNumber, row.afterdiscountamt);
    }

    /*
     * @returns {string} The unique identity.
     */
    function id(row) {
        return commons.makesure(row.rawtraninternalid) ? row.rawtraninternalid : row.internalid;
    }

    function setSublistValue(sublist, id, index, value) {
        if (commons.makesure(value)) {
            sublist.setSublistValue({
                id: id,
                line: index,
                value: value
            });
        }
    }

    function setUserData(data) {
        userData = data;
    }

    function setTransactionData(data) {
        transactionData = data;
    }

    function getMaxInvoiceAmount() {
        if (runtime.isOW()) {
            var subsidiary = record.load({
                type: record.Type.SUBSIDIARY,
                id: userData.subsidiaryId
            });
            var maxAmount = subsidiary.getValue('custrecord_cn_vat_max_invoice_amount');
        } else {
            var companyInfo = config.load({
                type: config.Type.COMPANY_INFORMATION
            });
            maxAmount = companyInfo.getValue('custrecord_cn_vat_max_invoice_amount')
        }
        return maxAmount;
    }

    return {
        renderAsPage: renderAsPage,
        setUserData: setUserData,
        setTransactionData: setTransactionData
    };

});
