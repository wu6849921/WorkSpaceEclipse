/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../../lib/wrapper/ns_wrapper_ui_serverWidget',
    '../../../lib/commons',
    '../app_cn_vat_label_parser'
],

function(serverWidget, commons, labelParser) {

    var resourceLabels;
    var transactionData;

    function labels() {
        if (!commons.makesure(resourceLabels)) {
            resourceLabels = labelParser.loadResourceFile();
        }
        return resourceLabels;
    }

    function renderAsPage() {
        var list = createList();
        addColumns(list);
        addRows(list);
        return list;
    }

    function createList() {
        var list = serverWidget.createList({
            title: ' ',
            hideNavBar: true
        });
        return list;
    }

    function addColumns(list) {
       var idColumn = list.addColumn({
            id: 'custpage_internalid',
            type: serverWidget.FieldType.URL,
            label: labels().tableHeader.internalId
        });
        idColumn.setURL(prepareRequestUrl());
        idColumn.addParamToURL({
            param: 'id',
            value: 'custpage_internalid',
            dynamic: true
        });
        list.addColumn({
            id: 'custpage_type',
            type: serverWidget.FieldType.TEXT,
            label: labels().tableHeader.tranType
        });
        list.addColumn({
            id: 'custpage_doc_number',
            type: serverWidget.FieldType.TEXT,
            label: labels().tableHeader.docNum
        });
    }

    function prepareRequestUrl() {
        return '/app/accounting/transactions/transaction.nl';
    }

    function addRows(list) {
        for (var i = 0; i < transactionData.length; i++) {
            var tranType = transactionData[i].getValue('custrecord_cn_vat_type');
            var internalId = transactionData[i].getValue('custrecord_cn_invoice_type_fk_tran');
            var docNo = transactionData[i].getValue('custrecord_cn_vat_docno');

            list.addRow({
                row: {
                    'custpage_internalid': commons.makesure(internalId) ? internalId : '',
                    'custpage_type': commons.makesure(tranType) ? labels().tableHeader[tranType] : '',
                    'custpage_doc_number': commons.makesure(docNo) ? docNo : ''
                }
            });
        }
    }

    function setTransactionData(tranData) {
        transactionData = tranData;
    }

    return {
        renderAsPage: renderAsPage,
        setTransactionData: setTransactionData
    };

});
