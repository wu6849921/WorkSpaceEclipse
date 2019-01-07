/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../lib/wrapper/ns_wrapper_search',
    './helper/search_helper'
],

function(search, helper) {

    function getVATByRecId(recIds) {

        if (recIds === null || recIds.length === 0) {
            return null;
        }

        var filters = [];
        var tempfilters;
        for ( var i in recIds) {
            tempfilters = [
                'custrecord_cn_invoice_type_fk_tran',
                'is',
                String(recIds[i])
            ];
            filters.push(tempfilters);
            if (recIds.length > 0 && i < recIds.length - 1) {
                filters.push('or');
            }

        }

        return run(filters);
    }


    function getVATByParentId(parents) {

        if (parents === null || parents.length === 0) {
            return null;
        }

        var filters = [
            [
                'parent',
                search.Operator.ANYOF,
                parents
            ]
        ];


        return run(filters);
    }

    function run(filters) {
        var cnVatInvoicesSearch = search.create({

            type: 'customrecord_cn_vat_invoices',

            filters: filters,

            columns: [
                {
                    name: "custrecord_cn_vat_status"
                },
                {
                    name: "custrecord_cn_vat_invoice_code"
                },
                {
                    name: "custrecord_cn_vat_invoice_number"
                },
                {
                    name: 'custrecord_cn_vat_invoice_date'
                },
                {
                    name: 'custrecord_cn_vat_invoice_tax_amount'
                },
                {
                    name: 'custrecord_cn_vat_invoice_tax_excl_amnt'
                },
                {
                    name: 'custrecord_cn_invoice_type_fk_tran'
                },
                {
                    name: "parent"
                }
            ]
        });

        var results = helper.resultset(cnVatInvoicesSearch.run());

        return results;
    }

    function queryMergedTransByParent(parent) {
        var columns = [
            helper.column('custrecord_cn_invoice_type_fk_tran').create(),
            helper.column('custrecord_cn_vat_type').create(),
            helper.column('custrecord_cn_vat_docno').create()
        ]
        var filters = [
            helper.filter('parent').is(parent)
        ];

        var searchTrans = search.create({
            type: 'customrecord_cn_vat_invoices',
            columns: columns,
            filters: filters
        });
        return helper.resultset(searchTrans.run());
    }

    return {
        getVATByRecId: getVATByRecId,
        getVATByParentId: getVATByParentId,
        queryMergedTransByParent: queryMergedTransByParent
    };

});
