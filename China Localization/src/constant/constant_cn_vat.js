/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([],

function() {
    return {
        FORMAT_TXT: 'txt',
        FORMAT_PAGE: 'html',
        FORMAT_DATA: 'data',
        STATUS: {
            SPLIT: 'split',
            CONSOLIDATED: 'consolidated'
        },
        SPLIT_LINE_LIMIT: 8,
        SHIPPING_HANDLING_ITEM_QUANTITY: {
            POSITIVE: 1,
            NEGATIVE: -1
        },
        PREFIX_INTERNAL_ID: 'CON',
        TRANSACTION_TYPE: {
            'CustInvc': 1,
            'CashSale': 2,
            'CustCred': 3,
            'CashRfnd': 4
        },
        INVOICE_TYPE: {
            COMMON_INVOICE: 1,
            SPECIAL_INVOICE: 0
        },
        REFERENCE_RECORD_NAME: 'CUSTRECORD_CN_VAT_PARENT',
        COLUMNS: {
            MAIN: {
                rawtraninternalid: 'custrecord_cn_invoice_type_fk_tran',
                id: 'id',
                parent: 'parent',
                VATCode: 'custrecord_cn_vat_invoice_code',
                VATNumber: 'custrecord_cn_vat_invoice_number',
                docdate: 'custrecord_cn_vat_invoice_date',
                docno: 'custrecord_cn_vat_docno',
                cusname: 'custrecord_cn_vat_cusname',
                cusaddrphoneno: 'custrecord_cn_vat_cusaddrphoneno',
                cusbankno: 'custrecord_cn_vat_cusbankno',
                custaxregno: 'custrecord_cn_vat_custaxregno',
                type: 'custrecord_cn_vat_type',
                itemnameforsales: 'custrecord_cn_vat_itemnameforsales',
                approver: 'custrecord_cn_vat_approver',
                receiver: 'custrecord_cn_vat_receiver',
                sellerbankno: 'custrecord_cn_vat_sellerbankno',
                selleraddrphoneno: 'custrecord_cn_vat_selleraddrphoneno',
                remark: 'custrecord_cn_vat_remark',
                invoiceType: 'custrecord_cn_vat_invoicetype',
                inforSheetNumber: 'custrecord_cn_vat_inforsheetnumber',
                errMsg: 'custrecord_cn_vat_errmsg',
                linequantity: 'custrecord_cn_vat_linequantity',
                taxexclusiveamt: 'custrecord_cn_vat_invoice_tax_excl_amnt',
                afterdiscountamt: 'custrecord_cn_vat_afterdiscountamt',
                status: 'custrecord_cn_vat_status',
                invoice_tax_amount: 'custrecord_cn_vat_invoice_tax_amount'
            },
            REFERENCE_ITEM: {
                internalid: 'internalid',
                rawiteminternalid: 'custrecord_cn_vat_iteminternalid',
                parent: 'custrecord_cn_vat_parent',
                discountamt: 'custrecord_cn_vat_discountamt',
                discountrate: 'custrecord_cn_vat_discountrate',
                discounttaxamt: 'custrecord_cn_vat_discounttaxamt',
                line: 'custrecord_cn_vat_line',
                model: 'custrecord_cn_vat_model',
                name: 'custrecord_cn_vat_name',
                pricemethod: 'custrecord_cn_vat_pricemethod',
                quantity: 'custrecord_cn_vat_quantity',
                taxamt: 'custrecord_cn_vat_taxamt',
                taxdenom: 'custrecord_cn_vat_taxdenom',
                taxexclusiveamt: 'custrecord_cn_vat_taxexclusiveamt',
                taxrate: 'custrecord_cn_vat_taxrate',
                unitprice: 'custrecord_cn_vat_unitprice',
                baseprice: 'custrecord_cn_vat_baseprice',
                itemtype: 'custrecord_cn_vat_itemtype',
                pricelevel: 'custrecord_cn_vat_pricelevel',
                uom: 'custrecord_cn_vat_uom'
            }
        }
    };
});
