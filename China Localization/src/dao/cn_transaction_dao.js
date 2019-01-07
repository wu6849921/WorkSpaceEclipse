/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../lib/wrapper/ns_wrapper_search',
    '../lib/wrapper/ns_wrapper_runtime',
    './helper/search_helper',
    '../lib/commons',
    '../app/vat/app_cn_vat_data_filter'
],

function(search, runtime, helper, commons, dataFilter) {

    var CUSTOMER_REFERENCE = runtime.isFeatureInEffect('JOBS') ? 'customerMain' : 'customer';

    /**
     * @desc fetch mainline cashsale/cash refund transactions by document number.
     * @param searchType {'CashSale','CashRfnd'}.
     * @param docNo document number. 
     * @param searchfor searchfor is F it means created from field is from customerMain field otherwise from UI. 
     * @return transactions result set. if doc number is null, return null.
     */
    function fetchMLCashTransByDocNo(customerId, searchType, docNo, searchfor) {
        if (!commons.makesure(docNo) || !commons.makesure(searchType) || !commons.makesure(customerId))
            return null;
        var params = {
            customerId: customerId,
            docNo: docNo,
            type: searchType,
            searchfor: searchfor
        }

        return fetchMainlainTransForCashRefund(params);
    }

    /**
     * fetch mainline cashsale/cash refund transactions by document number
     * @param params {params} 
     * @return transactions result set. if doc number is null, return null.
     */
    function fetchMainlainTransForCashRefund(params) {

        var filters = [
            helper.filter('mainline').is('T')
        ];

        filters.push(helper.filter('type').anyof(params.type))

        if (params.type === 'CashSale') {
            filters.push(helper.filter('number').equalto(params.docNo));
            filters.push(helper.filter('name').anyof(params.customerId));
        } else if (params.searchfor === 'F') {
            filters.push(helper.filter('custbody_cn_vat_createdfrom').is(params.docNo));
        } else {
            filters.push(helper.filter('createdfrom').anyof(params.docNo));
        }


        log.debug("fetchMainlainTransactions:params", params);
        var trSearch = search.create({
            type: search.Type.TRANSACTION,
            columns: [
                helper.column('custbody_cn_vat_createdfrom').create(),
                helper.column('createdfrom').create(),
                helper.column('type').create(),
                helper.column('tranid').create(),
                helper.column('entity').create()
            ],
            filters: filters
        })
        log.debug("fetchMainlainTransactions:filters", trSearch.filters);
        log.debug("fetchMainlainTransactions:columns", trSearch.columns);
        var rs = trSearch.run().getRange({
            start: 0,
            end: 1000
        }) || [];
        log.debug("fetchMainlainTransactions:rs", rs);
        return rs;
    }



    /**
     * @desc fetch mainline transactions by parameters. 
     * @param {object} [params] - parameters.
     * @return transaction list.
     */
    function fetchMainlainTransactions(params) {

        var filters = [
            helper.filter('mainline').is('T')
        ];
        if (commons.makesure(params.sheetNo)) {
            filters.push(helper.filter('custbody_cn_info_sheet_number').is(params.sheetNo))
        }
        if (commons.makesure(params.type)) {
            filters.push(helper.filter('type').anyof(params.type))
        }
        log.debug("fetchMainlainTransactions:params", params);
        var trSearch = search.create({
            type: search.Type.TRANSACTION,
            columns: [
                helper.column('custbody_cn_info_sheet_number').create()
            ],
            filters: filters
        })
        log.debug("fetchMainlainTransactions:filters", trSearch.filters);
        log.debug("fetchMainlainTransactions:columns", trSearch.columns);
        var rs = trSearch.run().getRange({
            start: 0,
            end: 1000
        }) || [];
        log.debug("fetchMainlainTransactions:rs", rs);
        return rs;
    }
    /**
     * @desc get transactions by internal id. 
     * @param {number} [internalId] - internal id.
     * @return transaction list.
     */
    function getTransactionByInternalID(internalId) {
        var vatSearch = search.load({
            id: 'customsearch_cn_export_vat'
        });

        var filters = vatSearch.filters;
        filters.push(helper.filter("internalid").is(internalId));

        return vatSearch.run().getRange({
            start: 0,
            end: 1000
        }) || [];
    }

    /**
     * @desc get transactions by internal IDs. 
     * @param Array [internalId] - internal IDs.
     * @return transaction list.
     */
    function getMainlineByInternalIDs(internalIDs) {
        var txSearch = search.create({
            type: search.Type.TRANSACTION,
            columns: [
                helper.column('internalid').create()
            ]
        });

        var filters = txSearch.filters;
        filters.push(helper.filter("internalid").anyof(internalIDs));
        filters.push(helper.filter('mainline').is('T'));

        return txSearch.run().getRange({
            start: 0,
            end: 1000
        }) || [];
    }
    /**
     * @desc fetch VAT transactions by parameters.
     * @param {object} [params] - parameters.
     * @return transaction list.
     */
    function fetchVATTransaction(params) {
        if (params == null) {
            return {};
        }
        var vatSearch = search.load({
            id: 'customsearch_cn_export_vat'
        });

        addFilters(vatSearch, params);
        addUOMFieldColumns(vatSearch);
        addAmountForeignFieldColumns(vatSearch);
        addCustomerFieldColumns(vatSearch);

        var results = helper.resultset({
            resultset: vatSearch.run(),
            start: 0,
            end: 10001
        });



        if (results !== null && results.length > 10000) {
            log.audit('cn_transaction_dao', 'expExceedGovernance, reach length 10000 limit');
            throw {
                type: 'expExceedGovernance'
            };
        }

        return dataFilter.filterExportedTransaction(results);
    }
    /**
     * @desc add filters for vat search.
     * @param [vatSearch] - vat search.
     * @param [params] - parameters.
     * @return filters.
     */
    function addFilters(vatSearch, params) {
        var filters = vatSearch.filters;
        if (!commons.makecertain(params)) {
            return filters;
        }
        if (commons.makesure(params.subsidiaryId) && parseInt(params.subsidiaryId) > 0) {
            filters.push(helper.filter('subsidiary').is(params.subsidiaryId));
        }
        if (commons.makesure(params.startDate)) {
            filters.push(helper.filter('trandate').onorafter(params.startDate));
        }
        if (commons.makesure(params.endDate)) {
            filters.push(helper.filter('trandate').onorbefore(params.endDate));
        }
        if (commons.makesure(params.customerIds)) {
            filters.push(helper.filter('internalid').reference(CUSTOMER_REFERENCE).anyof(params.customerIds));
        }
        if (commons.makesure(params.transTypes)) {
            filters.push(helper.filter('type').anyof(params.transTypes));
        }

        if (commons.makesure(params.minDocNo)) {
            filters.push(helper.filter('number').greaterthanorequalto([
                params.minDocNo
            ]));
        }
        if (commons.makesure(params.maxDocNo)) {
            filters.push(helper.filter('number').lessthanorequalto([
                params.maxDocNo
            ]));
        }
        return filters;
    }
    /**
     * @desc add customer field columns for vat search.
     * @param [vatSearch] - vat search.
     * @return column list.
     */
    function addCustomerFieldColumns(vatSearch) {
        var columns = vatSearch.columns;
        var CUSTOMER_COLUMNS = [
            'companyname',
            'vatregnumber',
            'phone',
            'isperson',
            'firstname',
            'middlename',
            'lastname',
            'billaddress',
            'custentity_bank_account_name',
            'custentity_cn_vat_taxpayer_types',
        ];
        for (var i = 0; i < CUSTOMER_COLUMNS.length; i++) {
            columns.push(helper.column(CUSTOMER_COLUMNS[i]).reference(CUSTOMER_REFERENCE).create());
        }
        columns.push(helper.column('custbody_cn_vat_invoice_type').create());
        columns.push(helper.column('custitem_cn_vat_item_model').reference('item').create());
        columns.push(helper.column('custbody_cn_vat_split_rule').create());
        return columns;
    }
    /**
     * @desc add UOM field columns for vat search.
     * @param [vatSearch] - vat search.
     * @return column list.
     */
    function addUOMFieldColumns(vatSearch) {
        var columns = vatSearch.columns;
        //enable Multiple Units of Measure
        if (runtime.isFeatureInEffect('UNITSOFMEASURE')) {
            columns.push(helper.column('unit').create());
        }
        return columns;
    }

    /**
     * @desc add Amount Foreign field columns for vat search.
     * @param [vatSearch] - vat search.
     * @return column list.
     */
    function addAmountForeignFieldColumns(vatSearch) {
        var columns = vatSearch.columns;
        if (runtime.isFeatureInEffect('MULTICURRENCY')) {
            columns.push(helper.column('fxamount').create());
        }
        return columns;
    }

    return {
        fetchVATTransaction: fetchVATTransaction,
        getTransactionByInternalID: getTransactionByInternalID,
        fetchMLCashTransByDocNo: fetchMLCashTransByDocNo,
        fetchMainlainTransactions: fetchMainlainTransactions,
        getMainlineByInternalIDs: getMainlineByInternalIDs
    };

});
