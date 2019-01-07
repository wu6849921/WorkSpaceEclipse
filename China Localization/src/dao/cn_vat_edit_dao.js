/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope public
 */
define([
    '../lib/wrapper/ns_wrapper_search',
    '../lib/wrapper/ns_wrapper_record',
    './helper/search_helper',
    '../lib/commons',
    '../constant/constant_cn_vat',
    '../lib/wrapper/ns_wrapper_format',
    '../app/vat/app_cn_vat_status'
],

function(search, record, helper, commons, constants, formatter, vatStatus) {

    var recordColumns;
    var recordType = 'customrecord_cn_vat_invoices';
    var ITEM_SUBLIST_ID = 'recmachcustrecord_cn_vat_parent';
    var ITEM_RECORD_TYPE = 'customrecord_cn_vat_edit_item';

    function columns() {
        if (!commons.makesure(recordColumns)) {
            recordColumns = {
                rawtraninternalid: helper.column(constants.COLUMNS.MAIN.rawtraninternalid).create(),
                id: helper.column(constants.COLUMNS.MAIN.id).create(),
                parent: helper.column(constants.COLUMNS.MAIN.parent).create(),
                VATCode: helper.column(constants.COLUMNS.MAIN.VATCode).create(),
                VATNumber: helper.column(constants.COLUMNS.MAIN.VATNumber).create(),
                docdate: helper.column(constants.COLUMNS.MAIN.docdate).create(),
                docno: helper.column(constants.COLUMNS.MAIN.docno).create(),
                cusname: helper.column(constants.COLUMNS.MAIN.cusname).create(),
                cusaddrphoneno: helper.column(constants.COLUMNS.MAIN.cusaddrphoneno).create(),
                cusbankno: helper.column(constants.COLUMNS.MAIN.cusbankno).create(),
                custaxregno: helper.column(constants.COLUMNS.MAIN.custaxregno).create(),
                type: helper.column(constants.COLUMNS.MAIN.type).create(),
                itemnameforsales: helper.column(constants.COLUMNS.MAIN.itemnameforsales).create(),
                approver: helper.column(constants.COLUMNS.MAIN.approver).create(),
                receiver: helper.column(constants.COLUMNS.MAIN.receiver).create(),
                sellerbankno: helper.column(constants.COLUMNS.MAIN.sellerbankno).create(),
                selleraddrphoneno: helper.column(constants.COLUMNS.MAIN.selleraddrphoneno).create(),
                remark: helper.column(constants.COLUMNS.MAIN.remark).create(),
                invoiceType: helper.column(constants.COLUMNS.MAIN.invoiceType).create(),
                inforSheetNumber: helper.column(constants.COLUMNS.MAIN.inforSheetNumber).create(),
                errMsg: helper.column(constants.COLUMNS.MAIN.errMsg).create(),
                linequantity: helper.column(constants.COLUMNS.MAIN.linequantity).create(),
                taxexclusiveamt: helper.column(constants.COLUMNS.MAIN.taxexclusiveamt).create(),
                afterdiscountamt: helper.column(constants.COLUMNS.MAIN.afterdiscountamt).create(),
                status: helper.column(constants.COLUMNS.MAIN.status).create(),
                invoice_tax_amount: helper.column(constants.COLUMNS.MAIN.invoice_tax_amount).create(),

                reference: {
                    internalid: helper.column(constants.COLUMNS.REFERENCE_ITEM.internalid).reference(constants.REFERENCE_RECORD_NAME).create(),
                    rawiteminternalid: helper.column(constants.COLUMNS.REFERENCE_ITEM.rawiteminternalid).reference(constants.REFERENCE_RECORD_NAME).create(),
                    parent: helper.column(constants.COLUMNS.REFERENCE_ITEM.parent).reference(constants.REFERENCE_RECORD_NAME).create(),
                    discountamt: helper.column(constants.COLUMNS.REFERENCE_ITEM.discountamt).reference(constants.REFERENCE_RECORD_NAME).create(),
                    discountrate: helper.column(constants.COLUMNS.REFERENCE_ITEM.discountrate).reference(constants.REFERENCE_RECORD_NAME).create(),
                    discounttaxamt: helper.column(constants.COLUMNS.REFERENCE_ITEM.discounttaxamt).reference(constants.REFERENCE_RECORD_NAME).create(),
                    line: helper.column(constants.COLUMNS.REFERENCE_ITEM.line).reference(constants.REFERENCE_RECORD_NAME).create(),
                    model: helper.column(constants.COLUMNS.REFERENCE_ITEM.model).reference(constants.REFERENCE_RECORD_NAME).create(),
                    name: helper.column(constants.COLUMNS.REFERENCE_ITEM.name).reference(constants.REFERENCE_RECORD_NAME).create(),
                    pricemethod: helper.column(constants.COLUMNS.REFERENCE_ITEM.pricemethod).reference(constants.REFERENCE_RECORD_NAME).create(),
                    quantity: helper.column(constants.COLUMNS.REFERENCE_ITEM.quantity).reference(constants.REFERENCE_RECORD_NAME).create(),
                    taxamt: helper.column(constants.COLUMNS.REFERENCE_ITEM.taxamt).reference(constants.REFERENCE_RECORD_NAME).create(),
                    taxdenom: helper.column(constants.COLUMNS.REFERENCE_ITEM.taxdenom).reference(constants.REFERENCE_RECORD_NAME).create(),
                    taxexclusiveamt: helper.column(constants.COLUMNS.REFERENCE_ITEM.taxexclusiveamt).reference(constants.REFERENCE_RECORD_NAME).create(),
                    taxrate: helper.column(constants.COLUMNS.REFERENCE_ITEM.taxrate).reference(constants.REFERENCE_RECORD_NAME).create(),
                    unitprice: helper.column(constants.COLUMNS.REFERENCE_ITEM.unitprice).reference(constants.REFERENCE_RECORD_NAME).create(),
                    baseprice: helper.column(constants.COLUMNS.REFERENCE_ITEM.baseprice).reference(constants.REFERENCE_RECORD_NAME).create(),
                    itemtype: helper.column(constants.COLUMNS.REFERENCE_ITEM.itemtype).reference(constants.REFERENCE_RECORD_NAME).create(),
                    pricelevel: helper.column(constants.COLUMNS.REFERENCE_ITEM.pricelevel).reference(constants.REFERENCE_RECORD_NAME).create(),
                    uom: helper.column(constants.COLUMNS.REFERENCE_ITEM.uom).reference(constants.REFERENCE_RECORD_NAME).create()
                }
            };
        }
        return recordColumns;
    }

    function fetchMergedData(mergedIds) {
        var invoicesObj = [];
        var invoices = query({
            transationIds: mergedIds,
            columns: columns()
        });

        for ( var i in invoices) {
            var internalId = invoices[i].id;
            var invoice = invoices[i];
            if (!isHeaderAlreadyExisted(invoicesObj, internalId)) {
                addNewHeader(invoicesObj, invoice, internalId);
            } else {
                appendItems(invoicesObj, invoice, internalId);
            }
        }

        var data = parseParentChildren(invoicesObj);
        log.debug('cn_vat_edit_dao: ', 'processData - invoice after children added: ' + JSON.stringify(data));
        return data;
    }

    function isHeaderAlreadyExisted(invoicesObj, internalId) {
        return commons.makecertain(invoicesObj[internalId]);
    }

    function addNewHeader(invoicesObj, invoice, internalId) {
        var invoiceAfterParsed = getTransactionHeader(invoice);
        var items = getTransactionItems(invoice);
        invoicesObj[internalId] = invoiceAfterParsed;
        invoiceAfterParsed.pushItem(items);
        log.debug('cn_vat_edit_dao: ', 'addNewHeader - invoice: ' + JSON.stringify(invoiceAfterParsed));
    }

    function appendItems(invoicesObj, invoice, internalId) {
        var invoiceAlreadyExisted = invoicesObj[internalId];
        var items = getTransactionItems(invoice);
        invoiceAlreadyExisted.pushItem(items);
        log.debug('cn_vat_edit_dao: ', 'appendItems - invoice: ' + JSON.stringify(invoiceAlreadyExisted));
    }

    function getTransactionHeader(searchResult) {
        return {
            rawtraninternalid: getValue(searchResult, columns().rawtraninternalid),
            parent: getValue(searchResult, columns().parent),
            cusname: getValue(searchResult, columns().cusname),
            cusaddrphoneno: getValue(searchResult, columns().cusaddrphoneno),
            cusbankno: getValue(searchResult, columns().cusbankno),
            custaxregno: getValue(searchResult, columns().custaxregno),
            type: getValue(searchResult, columns().type),
            docno: getValue(searchResult, columns().docno),
            internalid: getValue(searchResult, columns().id),
            docdate: getValue(searchResult, columns().docdate),
            itemnameforsales: getValue(searchResult, columns().itemnameforsales),
            approver: getValue(searchResult, columns().approver),
            receiver: getValue(searchResult, columns().receiver),
            sellerbankno: getValue(searchResult, columns().sellerbankno),
            selleraddrphoneno: getValue(searchResult, columns().selleraddrphoneno),
            remark: getValue(searchResult, columns().remark),
            invoiceType: getValue(searchResult, columns().invoiceType),
            inforSheetNumber: getValue(searchResult, columns().inforSheetNumber),
            VATCode: getValue(searchResult, columns().VATCode),
            VATNumber: getValue(searchResult, columns().VATNumber),
            errMsg: getValue(searchResult, columns().errMsg),
            linequantity: getValue(searchResult, columns().linequantity),
            taxexclusiveamt: getValue(searchResult, columns().taxexclusiveamt),
            afterdiscountamt: getValue(searchResult, columns().afterdiscountamt),
            status: getVatStatus(searchResult),
            invoice_tax_amount: getValue(searchResult, columns().invoice_tax_amount),
            editable: true,
            items: [],
            children: [],
            pushItem: function(item) {
                if (commons.makesureall(item, 'internalid')) {
                    this.items.push(item);
                }
            },
            pushChild: function(child) {
                this.children.push(child);
            }
        };
    }

    function getTransactionItems(searchResult) {
        return {
            internalid: getValue(searchResult, columns().reference.internalid),
            rawiteminternalid: getValue(searchResult, columns().reference.rawiteminternalid),
            parent: getValue(searchResult, columns().reference.parent),
            line: getValue(searchResult, columns().reference.line),
            name: getValue(searchResult, columns().reference.name),
            model: getValue(searchResult, columns().reference.model),
            quantity: getValue(searchResult, columns().reference.quantity),
            taxexclusiveamt: formatter.round(getValue(searchResult, columns().reference.taxexclusiveamt), ''),
            taxrate: formatter.round(getValue(searchResult, columns().reference.taxrate), ''),
            discountamt: formatter.round(getValue(searchResult, columns().reference.discountamt), ''),
            taxdenom: getValue(searchResult, columns().reference.taxdenom),
            taxamt: getValue(searchResult, columns().reference.taxamt),
            discounttaxamt: getValue(searchResult, columns().reference.discounttaxamt),
            discountrate: getValue(searchResult, columns().reference.discountrate),
            unitprice: getValue(searchResult, columns().reference.unitprice),
            baseprice: formatter.round(getValue(searchResult, columns().reference.baseprice), ''),
            itemtype: getValue(searchResult, columns().reference.itemtype),
            pricelevel: getValue(searchResult, columns().reference.pricelevel),
            pricemethod: getValue(searchResult, columns().reference.pricemethod),
            uom: getValue(searchResult, columns().reference.uom)
        };
    }

    function getVatStatus(searchResult) {
        var status = searchResult.getText(columns().status);
        if (commons.makesure(status)) {
            for ( var code in vatStatus.Status) {
                if (vatStatus.Status[code] === status) {
                    return code;
                }
            }
        }
        return status;
    }

    function parseParentChildren(invoices) {
        var invoicesObj = {};
        for ( var i in invoices) {
            var invoice = invoices[i];
            var internalId = invoice.internalid;
            if (!commons.makesure(invoice.parent)) {
                if (!commons.makecertain(invoicesObj[invoice.parent])) {
                    invoicesObj[internalId] = invoice;
                }
            } else {
                if (!commons.makecertain(invoicesObj[invoice.parent])) {
                    invoicesObj[invoice.parent] = invoices[invoice.parent];
                    invoicesObj[invoice.parent].pushChild(invoice);
                } else {
                    invoicesObj[invoice.parent].pushChild(invoice);
                }
            }
        }

        var invoices = [];
        for ( var j in invoicesObj) {
            invoices.push(invoicesObj[j]);
        }

        return invoices;
    }

    function getValue(result, column) {
        var ret = result.getValue(column);
        return commons.makesure(ret) ? ret : '';
    }



    function query(options) {
        var invoices = [];
        var transationIds = options.transationIds;
        if (commons.makesure(transationIds)) {
            var columns = options.columns;
            var parentIds = queryParentIds(transationIds, columns);
            if (commons.makesure(parentIds)) {
                invoices = queryInvoices(parentIds, columns);
            }
        }
        return invoices;
    }

    function queryParentIds(transationIds, columns) {
        var transationIdsFilter = search.createFilter({
            name: 'internalid',
            operator: search.Operator.ANYOF,
            values: transationIds
        });
        var tranSearch = search.create({
            type: recordType,
            filters: [
                transationIdsFilter
            ],
            columns: [
                columns.parent
            ]
        });

        var parentInvoiceIds = helper.resultset({
            resultset: tranSearch.run(),
            start: 0,
            end: 10000
        });

        var parentIds = [];
        for ( var i in parentInvoiceIds) {
            var parentInvoiceId = parentInvoiceIds[i].getValue(columns.parent);
            if (!commons.contains(parentIds, parentInvoiceId) && commons.makesure(parentInvoiceId)) {
                parentIds.push(parentInvoiceId);
            }

        }
        return parentIds;
    }

    function queryInvoices(parentIds, columns) {
        var tranSearch = search.create({
            type: recordType,
            filters: [
                [
                    'internalid',
                    search.Operator.ANYOF,
                    parentIds
                ],
                'or',
                [
                    'parent',
                    search.Operator.ANYOF,
                    parentIds
                ]
            ],
            columns: [
                columns.rawtraninternalid,
                columns.id,
                columns.parent,
                columns.VATCode,
                columns.VATNumber,
                columns.docdate,
                columns.docno,
                columns.cusname,
                columns.cusaddrphoneno,
                columns.cusbankno,
                columns.custaxregno,
                columns.type,
                columns.itemnameforsales,
                columns.approver,
                columns.receiver,
                columns.sellerbankno,
                columns.selleraddrphoneno,
                columns.remark,
                columns.invoiceType,
                columns.inforSheetNumber,
                columns.errMsg,
                columns.linequantity,
                columns.taxexclusiveamt,
                columns.afterdiscountamt,
                columns.status,
                columns.invoice_tax_amount,
                columns.reference.internalid,
                columns.reference.rawiteminternalid,
                columns.reference.parent,
                columns.reference.discountamt,
                columns.reference.discountrate,
                columns.reference.discounttaxamt,
                columns.reference.line,
                columns.reference.model,
                columns.reference.name,
                columns.reference.pricemethod,
                columns.reference.quantity,
                columns.reference.taxamt,
                columns.reference.taxdenom,
                columns.reference.taxexclusiveamt,
                columns.reference.taxrate,
                columns.reference.unitprice,
                columns.reference.baseprice,
                columns.reference.itemtype,
                columns.reference.pricelevel,
                columns.reference.taxdenom,
                columns.reference.uom
            ]
        });

        var invoices = helper.resultset({
            resultset: tranSearch.run(),
            start: 0,
            end: 10000
        });

        return invoices;
    }

    function save(changes) {

        for (var i = 0; i < changes.length; i++) {

            if (changes[i].rec_status === "delete") {
                doDelete(changes[i]);
            } else if (changes[i].rec_status === "create") {
                create(changes[i]);
            }
        }
    }


    function create(consolidatedData) {
        log.debug('cn_vat_edit_dao::createData', 'consolidatedData: ' + JSON.stringify(consolidatedData));

        //createParent
        var parentId = createCookedTransaction(consolidatedData);
        createChildren(consolidatedData.children, parentId);

    }

    function createChildren(children, parentId) {

        for (var i = 0; i < children.length; i++) {
            children[i].parent = parentId;
            createCookedTransaction(children[i]);
        }
    }

    function createCookedTransaction(invoice) {
        var vatRec = record.create({
            type: recordType,
            isDynamic: true
        });

        setMainValues(vatRec, invoice);
        addSublistValues(vatRec, invoice);
        var saveId = vatRec.save();
        log.debug('cn_vat_edit_dao::createCookedTransaction', 'created  customrecord_cn_vat_invoices id [' + saveId + '] ');
        return saveId;
    }

    function preprocess(invoice) {
        //cache internalid is the trasaction id
        //first merge, no transId, internalid is original transaction's id
        //if merge-save-unmerge-merge, the data will have transid and internalid, just keep it
        if (!commons.makesure(invoice.rawtraninternalid)) {
            invoice.rawtraninternalid = invoice.internalid;
        }
    }

    function setMainValues(vatRecord, invoice) {
        preprocess(invoice);

        var MAIN_FIELDS = constants.COLUMNS.MAIN;
        for ( var cachName in MAIN_FIELDS) {
            var fieldId = MAIN_FIELDS[cachName];
            var fieldValue = invoice[cachName];

            if (fieldId === MAIN_FIELDS.status) {
                vatRecord.setText({
                    fieldId: fieldId,
                    text: vatStatus.Status[fieldValue]
                });
            } else {
                vatRecord.setValue({
                    fieldId: fieldId,
                    value: fieldValue
                });
            }
        }

    }

    function addSublistValues(vatRecord, invoice) {
        var ITEM_FIELDS = constants.COLUMNS.REFERENCE_ITEM;
        for (var i = 0; i < invoice.items.length; i++) {
            var item = invoice.items[i];
            vatRecord.selectNewLine({
                sublistId: ITEM_SUBLIST_ID
            });
            for ( var vatField in item) {
                var fieldId = ITEM_FIELDS[vatField];

                fieldId && vatRecord.setCurrentSublistValue({
                    sublistId: ITEM_SUBLIST_ID,
                    'fieldId': fieldId,
                    value: item[vatField]
                });
            }
            vatRecord.commitLine({
                sublistId: ITEM_SUBLIST_ID
            });
        }

    }

    function doDelete(consolidatedData) {
        log.debug('cn_vat_edit_dao:delete', 'consolidatedData: ' + JSON.stringify(consolidatedData));

        var children = consolidatedData.children;

        for (var i = 0; i < children.length; i++) {
            deleteCookedTransaction(children[i]);
        }

        deleteCookedTransaction(consolidatedData);
    }

    function deleteCookedTransaction(invoice) {
        if (!commons.makesure(invoice)) {
            return;
        }
        deleteItems(invoice.items);

        record.remove({
            type: 'customrecord_cn_vat_invoices',
            id: invoice.internalid
        });
        log.debug('cn_vat_edit_dao:deleteCookedTransaction', 'deleted id: [' + invoice.internalid + ']');


    }

    function deleteItems(items) {
        if (!commons.makesure(items)) {
            return;
        }
        for (var i = 0; i < items.length; i++) {
            record.remove({
                type: ITEM_RECORD_TYPE,
                id: items[i].internalid
            });
            log.debug('cn_vat_edit_dao:deleteItems', 'deleted id: [' + items[i].internalid + ']');
        }
    }

    return {
        save: save,
        fetchMergedData: fetchMergedData
    };
});
