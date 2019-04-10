/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../lib/wrapper/ns_wrapper_search',
    '../lib/wrapper/ns_wrapper_record',
    './helper/search_helper',
    '../app/helper/cashflow_helper',
    '../lib/commons',
    '../lib/wrapper/ns_wrapper_runtime'
],

function(search, record, helper, cashflowHelper, commons, runtime) {
    /**
     * @desc fetch AP transactions by payment Id.
     * @param {object} tranid.
     * @return {object} bills.
     */
    function fetchAPTransaction(tranid, paidTransIdArray) {
        if (!paidTransIdArray || paidTransIdArray.length < 1) {
            return {};
        }

        /**
         * NSCHINA-3050 Direct Void ('Void Transactions Using Reversing Journals' preference is disabled)
         * For direct voided vendor payment or check, collected data should be empty because transaction amount is zero.
         */
        if (matchDirectVoidTransaction(tranid)) {
            return {};
        }

        var apSearch = search.load({
            id: 'customsearch_cfs_ap_trans'
        });
        //NSCHINA-2429
        //Dynamic add columns when feature enabled
        log.debug('fetchAPTransaction', 'origin columns=' + JSON.stringify(apSearch.columns));
        var queryColumns = columns(apSearch);
        apSearch.columns = queryColumns;
        log.debug('fetchAPTransaction', 'new columns=' + JSON.stringify(apSearch.columns));
        apSearch.filters.push(search.createFilter({
            name: 'internalid',
            operator: search.Operator.ANYOF,
            values: paidTransIdArray
        }));

        apSearch.filters.push(search.createFilter({
            name: 'nonreimbursable',
            operator: search.Operator.IS,
            values: false
        }));

        apSearch.filters.push(search.createFilter({
            name: 'type',
            join: 'item',
            operator: search.Operator.NONEOF,
            values: [
                'Discount',
                'Subtotal',
                'EndGroup',
                'Group',
                'Markup',
                'Description'
            ]
        }));

        var apTransactions = [];
        var tempTransactions = [];
        var startIndex = 0;
        while (startIndex === 0 || tempTransactions.length > 0) {

            tempTransactions = apSearch.run().getRange({
                start: startIndex,
                end: startIndex + 1000
            });
            startIndex = startIndex + 1000;
            apTransactions = apTransactions.concat(tempTransactions);
        }
        return consolidateAPTransactions(apTransactions, tranid);
    }


    //Add location/department/classification columns to original AP saved search if feature enabled
    function columns(apSearch) {
        var array = apSearch.columns;
        array.push(helper.column('advance').create());
        array.push(helper.column('expensecategory').create());
        //NSCHINA-2429
        //Add location/department/classification filter to CFS collector
        if (runtime.isLocationEnabled()) {
            array.push(helper.column('location').create());
        }

        if (runtime.isDepartmentEnabled()) {
            array.push(helper.column('department').create());
        }

        //As AP saved search is based on Transaction, the column name has be to align with field id of CLASS (internalid: class) on Transaction record
        if (runtime.isClassesEnabled()) {
            array.push(helper.column('class').create());
        }
        return array;
    }

    /**
     * @desc compose the searched bills into object.
     * @param {object} bills - search resultset.
     * @return {object} result object.
     */
    function consolidateAPTransactions(apTransactions, tranid) {
        var result = {};
        for (var i = 0; i < apTransactions.length; i++) {
            if (result[apTransactions[i].id] === undefined) {
                if (apTransactions[i].getValue({
                    name: 'mainline'
                }) === '*') {
                    result[apTransactions[i].id] = {};
                    var mainline = {};
                    mainline.totalAmount = apTransactions[i].getValue('total');
                    if (apTransactions[i].getValue('advance') !== '') {
                        mainline.advToApplyAmount = apTransactions[i].getValue('advance');
                    } else {
                        mainline.advToApplyAmount = 0;
                    }
                    mainline.paidInFull = !(apTransactions[i].getValue('amountremaining') > 0);
                    mainline.cfsItem = apTransactions[i].getValue(search.createColumn({
                        name: 'internalid',
                        join: 'custbody_cseg_cn_cfi'
                    }));
                    mainline.transType = apTransactions[i].getValue('type');
                    mainline.transDate = apTransactions[i].getValue('trandate');
                    mainline.subsidiary = apTransactions[i].getValue('subsidiary');
                    //NSCHINA-2429
                    //Add location/department/classification to CFS ap collector
                    mainline.location = apTransactions[i].getValue('location');
                    mainline.department = apTransactions[i].getValue('department');
                    mainline.classification = apTransactions[i].getValue('class');
                    log.debug("mainline.subsidiary", mainline.subsidiary);
                    log.debug("mainline.location", mainline.location);
                    log.debug("mainline.department", mainline.department);
                    log.debug("mainline.classification", mainline.classification);
                    mainline.period = apTransactions[i].getValue('postingperiod');
                    mainline.transId = apTransactions[i].id;
                    result[apTransactions[i].id]['mainline'] = mainline;
                } else {
                    log.error('UE Payment', 'The first bill record is not mainline');
                    continue;
                }
            } else {
                // only ignore the advance to apply line of expense Report
                if (apTransactions[i].getValue('type') === 'ExpRept' && apTransactions[i].getValue('expensecategory') === '') {
                    continue;
                }
                if (apTransactions[i].getValue({
                    name: 'mainline'
                }) !== '*') {
                    if (result[apTransactions[i].id]['itemlines'] === undefined) {
                        var itemLinesArray = [];
                        result[apTransactions[i].id]['itemlines'] = itemLinesArray;
                    }
                    var line = {};
                    var tranType = apTransactions[i].getValue('type');
                    var lineAmount = commons.toAbsNumber(apTransactions[i].getValue('netamount'));
                    if (tranType === 'VendCred') {
                        lineAmount = -lineAmount;
                    }
                    line.amount = cashflowHelper.cashamount({
                        amount: lineAmount,
                        taxrate: apTransactions[i].getValue({
                            name: 'rate',
                            join: 'taxitem'
                        }),
                        taxamount: apTransactions[i].getValue('taxamount')
                    });
                    line.cfsItem = apTransactions[i].getValue(search.createColumn({
                        name: 'internalid',
                        join: 'custcol_cseg_cn_cfi'
                    }));
                    //NSCHINA-2429
                    //Add location/department/classification to CFS ap collector
                    line.location = apTransactions[i].getValue('location');
                    line.department = apTransactions[i].getValue('department');
                    line.classification = apTransactions[i].getValue('class');

                    line.lineuniquekey = apTransactions[i].getValue('lineuniquekey');
                    result[apTransactions[i].id]['itemlines'].push(line);
                }
            }
        }
        return result;
    }

    /**
     * Return true if transaction with given internalId is voided and amount equals to 0. Otherwise return false.
     */
    function matchDirectVoidTransaction(internalId) {
        var apSearch = search.create({
            type: search.Type.TRANSACTION,
            columns: [
                helper.column('amount').create()
            ],
            filters: [
                search.createFilter({
                    name: 'internalid',
                    operator: search.Operator.ANYOF,
                    values: internalId
                }),
                search.createFilter({
                    name: 'mainline',
                    operator: search.Operator.IS,
                    values: 'T'
                }),
                search.createFilter({
                    name: 'voided',
                    operator: search.Operator.IS,
                    values: 'T'
                }),
                search.createFilter({
                    name: 'amount',
                    operator: search.Operator.EQUALTO,
                    values: '0'
                })
            ]
        });
        var apSearchResult = apSearch.run().getRange({
            start: 0,
            end: 1
        }) || [];
        if (apSearchResult.length > 0) {
            log.audit('matchDirectVoidTransaction', internalId + ' matchDirectVoid=true');
            return true;
        } else {
            log.audit('matchDirectVoidTransaction', internalId + ' matchDirectVoid=false');
            return false;
        }
    }

    return {
        fetchAPTransaction: fetchAPTransaction
    };

});
