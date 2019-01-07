/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/wrapper/ns_wrapper_record'
],

function(record) {
    /**
     * @param Object{
        "invoiceStatus"       : invoiceStatus
        "invoiceCategoryCode" : invoiceCategoryCode,
        "vatInvoiceNo"        : vatInvoiceNo,
        "invoiceDate"         : invoiceDate,
        "salesDocNO"          : salesDocNO
     * }
     * @return interalId
     *  
     */
    function save(params) {
        var vatInvoiceRecord = record.create({
            type: 'customrecord_cn_vat_invoices',
            isDynamic: true
        });
        vatInvoiceRecord.setText({
            fieldId: 'custrecord_cn_vat_status',
            text: params.invoiceStatus
        });
        vatInvoiceRecord.setValue({
            fieldId: 'custrecord_cn_vat_invoice_code',
            value: params.invoiceCategoryCode
        });
        vatInvoiceRecord.setValue({
            fieldId: 'custrecord_cn_vat_invoice_number',
            value: params.vatInvoiceNo
        });
        vatInvoiceRecord.setValue({
            fieldId: 'custrecord_cn_vat_invoice_date',
            value: params.invoiceDate
        });
        vatInvoiceRecord.setValue({
            fieldId: 'custrecord_cn_invoice_type_fk_tran',
            value: params.salesDocNO
        });
        vatInvoiceRecord.setValue({
            fieldId: 'custrecord_cn_vat_invoice_tax_amount',
            value: params.taxAmount
        });
        vatInvoiceRecord.setValue({
            fieldId: 'custrecord_cn_vat_invoice_tax_excl_amnt',
            value: params.taxExclusiveAmount
        });

        return vatInvoiceRecord.save();
    }
    /**
     * 
     * delete vat invoices by ids
     * @param  ids[Array]
     *  
     */
    function remove(ids) {
        if (ids === null || ids.length === 0) {
            return;
        }
        for ( var i in ids) {
            try {
                record.remove({
                    type: 'customrecord_cn_vat_invoices',
                    id: ids[i]
                });
            } catch (ex) {
                log.debug('app_cn_vat_file_import_helper:remove', 'record does not exist,id:' + ids[i]);
            }

        }

    }

    return {
        save: save,
        remove: remove
    };

});
