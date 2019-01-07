/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    '../lib/wrapper/ns_wrapper_search',
    './helper/search_helper',
    '../lib/commons',
    './cn_accounting_period_dao',
    '../lib/wrapper/ns_wrapper_runtime'
],

/*
 * This file is for client caller script, note 'log' doesn't work here! For server-side script caller script, use cn_voucher_dao.js.
 */
function(search, helper, commons, periodDao, runtime) {
	/**
	 * @desc create filters by parameters.
	 * @param {object} [params] - parameters.
	 * @return filters.
	 */
    function filters(params) {
        var filters = [];
        filters.push(helper.filter('posting').is(true));
        filters.push(helper.filter('amount').notequalto(0));
        if (commons.makesure(params.trantype)) {
            filters.push(helper.filter('type').anyof(params.trantype));
        }
        if (commons.ensure(params.id)) {
            filters.push(helper.filter('internalid').is(params.id));
        }
        if (commons.ensure(params.subsidiary)) {
            filters.push(helper.filter('internalid').reference('subsidiary').is(params.subsidiary));
        }
        if (commons.ensure(params.period)) {
            if (commons.ensure(params.period.from)) {
                var fromDateRange = periodDao.getDateRange(params.period.from);
                if (commons.ensure(fromDateRange))
                    filters.push(helper.filter('startdate').reference('accountingperiod').onorafter(fromDateRange.startdate));
            }
            if (commons.ensure(params.period.to)) {
                var toDateRange = periodDao.getDateRange(params.period.to);
                if (commons.ensure(toDateRange))
                    filters.push(helper.filter('enddate').reference('accountingperiod').onorbefore(toDateRange.enddate));
            }
        }
        if (commons.ensure(params.trandate)) {
            if (commons.ensure(params.trandate.from)) {
                filters.push(helper.filter('trandate').onorafter(params.trandate.from));
            }
            if (commons.ensure(params.trandate.to)) {
                filters.push(helper.filter('trandate').onorbefore(params.trandate.to));
            }
        }
        if (runtime.isGLAuditNumbering() && 
            commons.ensure(params.glnumber) && commons.ensure(params.glnumber.oper) && commons.ensure(params.glnumber.value)) {
            if ("is" === params.glnumber.oper)
                filters.push(helper.filter('glnumber').is(params.glnumber.value));
            else if ("startswith" === params.glnumber.oper)
                filters.push(helper.filter('glnumber').startswith(params.glnumber.value));          
        }

        return filters;
    }

    /**
     * @desc Get transaction line total count.
     * @param {Object} params - Parameters collected from user inputs.
     * @return transaction line total count.
     */
    function getTransactionLineTotalCount(params) {
        var transCountColumn = search.createColumn({
            name: 'lineuniquekey',
            summary: search.Summary.COUNT
        });

        var columnsCount = [
            transCountColumn
        ];

        var searchCount = search.create({
            type: search.Type.TRANSACTION,
            columns: columnsCount,
            filters: filters(params)
        });

        var searchResult = searchCount.run().getRange(0, 1);
        if (!commons.ensure(searchResult))
            return 0;

        return searchResult[0].getValue({
            name: 'lineuniquekey',
            summary: search.Summary.COUNT
        });
    }

    return {
        getTransactionLineTotalCount: getTransactionLineTotalCount
    };

});
