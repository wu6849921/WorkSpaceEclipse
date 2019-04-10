/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../lib/wrapper/ns_wrapper_search',
    './helper/search_helper',
    './cn_accounting_period_dao',
    '../lib/wrapper/ns_wrapper_runtime',
    '../lib/commons'
],

function(search, helper, periodDao, runtime, commons) {

    /**
     * @desc fetch transaction entries by parameters.
     * @param {object} [params] - parameters.
     * @return transaction entry list.
     */
    function fetchTransactionEntries(params) {
        if (!commons.makesure(params)) {
            return;
        }
        return query(params);
    }

    /**
     * @desc query cashflows by parameters.
     * @param {object} [params] - parameters.
     * @return cashflow list.
     */
    function query(params) {
        var savedSearch = search.load({
            id: 'customsearch_cn_cashflow_collect'
        });
        savedSearch.columns = columns(params);
        savedSearch.filters = filters(params);
        return savedSearch.run();
    }

    /**
     * @desc create cashflow columns.
     * @return {array} - column list.
     */
    function columns(params) {
        var array = [
            helper.column('mainline').create(),
            helper.column('type').create(),
            helper.column('postingperiod').create(),
            helper.column('trandate').create(),
            helper.column('type').reference('account').create(),
            helper.column('amount').create(),
            helper.column('debitamount').create(),
            helper.column('creditamount').create(),
            helper.column('rate').reference('taxitem').create(),
            helper.column('netamount').create(),
            helper.column('taxamount').create(),
            helper.column('total').create(),
            helper.column('amountremainingisabovezero').create(),
            helper.column('custbody_cseg_cn_cfi').create(),
            helper.column('custcol_cseg_cn_cfi').create(),
            helper.column('internalid').reference('custbody_cseg_cn_cfi').create(),
            helper.column('internalid').reference('custcol_cseg_cn_cfi').create(),
            helper.column('deposittransaction').create(),
            helper.column('type').reference('item').create(),
            helper.column('lineuniquekey').create(),
            helper.column('isreversal').create()
        ];

        //NSCHINA-2429
        //Add location/department/class filter to CFS collector
        if (runtime.isLocationEnabled()) {
            array.push(helper.column('location').create());
        }

        if (runtime.isDepartmentEnabled()) {
            array.push(helper.column('department').create());
        }

        if (runtime.isClassesEnabled()) {
            array.push(helper.column('class').create());
        }

        if (params.hasdeposit || params.hascredit) {
            array.push(helper.column('appliedtotransaction').create());
            if (runtime.isMultiCurrency()) {
                array.push(helper.column('appliedtoforeignamount').create());
            }
        } else {
            array.push(helper.column('paidamount').create());
            array.push(helper.column('paidTransaction').create());
        }
        if (runtime.isMultiCurrency()) {
            array.push(helper.column('exchangerate').create());
        }
        if (runtime.isOW()) {
            array.push(helper.column('subsidiary').asc().create());
        }
        return array;
    }

    /**
     * @desc create filters.
     * @param {object} [params] - parameters.
     * @return {array} - filters.
     */
    function filters(params) {
        var filters = [];

        var types = [
            'Journal',
            'intercompanyjournalentry',
            'advintercompanyjournalentry',
            'VendPymt',
            'VendBill',
            'CashSale'/*{value:'CashSale', text:'Cash Sale', recordType:'cashsale'}*/,
            'CashRfnd'/*{value:'CashRfnd', text:'Cash Refund', recordType:'cashrefund'}*/,
            'CustPymt'/*{value:'CustPymt', text:'Payment', recordType:'customerpayment'}*/,
            'CustInvc'/*{value:'CustInvc', text:'Invoice', recordType:'invoice'}*/,
            'CustDep'/*{value:'CustDep', text:'Customer Deposit', recordType:'customerdeposit'}*/,
            'CustRfnd' /*{value:'CustRfnd', text:'Customer Refund', recordType:'customerrefund'}*/,
            'Deposit'/*{value:'Deposit', text:'Deposit', recordType:'deposit'}*/,
            'CustChrg'/*{value:'CustChrg', text:'Statement Charge', recordType:'customercharge'}*/
        ];
        if (commons.makesure(params.types)) {
            types = params.types;
        }
        filters.push(helper.filter('type').anyof(types));
        filters.push(helper.filter('posting').is(true));
        filters.push(helper.filter('amount').notequalto(0));
        filters.push(helper.filter('amount').isnotempty());
        filters.push(helper.filter('taxline').is(false));
        filters.push(helper.filter('cogs').is(false));
        filters.push(helper.filter('type').reference('item').noneof([
            'Discount',
            'Subtotal',
            'Group',
            'EndGroup',
            'Markup',
            'Description'
        ]));
        filters.push(helper.filter('paidamountisdiscount').is(false));

        if (runtime.isMultiCurrency()) {
            filters.push(helper.filter('fxamount').isnotempty());
        }
        if (commons.makesure(params.period)) {
            var dateRange = periodDao.getDateRange(params.period);
            if (commons.makesure(dateRange)) {
                filters.push(helper.filter('startdate').reference('accountingperiod').after(dateRange.enddate));
            }
        }
        if (commons.makesure(params.trandate)) {
            filters.push(helper.filter('trandate').after(params.trandate));
        }

        if (commons.makesure(params.ids)) {
            filters.push(helper.filter('internalid').anyof(params.ids));
        }
        if (commons.makesure(params.paidTransaction)) {
            filters.push(helper.filter('paidTransaction').anyof(params.paidTransaction));
        }
        if (commons.makesure(params.depositTransaction)) {
            filters.push(helper.filter('depositTransaction').anyof(params.depositTransaction));
        }
        if (commons.makesure(params.appliedToTransaction)) {
            filters.push(helper.filter('appliedToTransaction').anyof(params.appliedToTransaction));
        }

        log.debug("Cash Flow DAO: filters", filters);
        return filters;
    }

    function fetchCollectedCashflowStatementEntries(params) {
        if(!commons.makesure(params.tranid)){
            return [];
        }

        var collectedDetailSearch = search.create({
            type: 'customrecord_cn_cashflow_record_detail',
            columns: collectedDetailColumns(),
            filters: collectedDetailFilters(params)
        });
        return helper.resultset(collectedDetailSearch.run());
    }

    function collectedDetailColumns() {
        //NSCHINA-2429
        //Add location/department/class columns
        var column = [
            helper.column('custrecord_cfs_subsidiary').create(),
            helper.column('custrecord_cfs_item').create(),
            helper.column('custrecord_cfs_amount').create(),
            helper.column('custrecord_cfs_location').create(),
            helper.column('custrecord_cfs_department').create(),
            helper.column('custrecord_cfs_class').create()
        ];

        log.debug('cn_cashflow_dao.js, fetchCollectedCashflowStatementEntries', 'Column is ' + JSON.stringify(column));
        return column;
    }

    function collectedDetailFilters(params) {
        var filters = [
            helper.filter('custrecord_cfs_pymt_tranid').is(params.tranid),
            helper.filter('custrecord_mass_cfs_parent').noneof('@NONE@')
        ];
        log.debug('cn_cashflow_dao.js, fetchCollectedCashflowStatementEntries', 'Filter is ' + JSON.stringify(filters));
        return filters
    }

    return {
        fetchTransactionEntries: fetchTransactionEntries,
        fetchCollectedCashflowStatementEntries: fetchCollectedCashflowStatementEntries
    };

});
