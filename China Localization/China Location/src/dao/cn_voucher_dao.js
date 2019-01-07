/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../lib/wrapper/ns_wrapper_runtime',
    '../lib/wrapper/ns_wrapper_search',
    './helper/search_helper',
    '../lib/commons',
    './cn_accounting_period_dao',
    '../lib/wrapper/ns_wrapper_format',
    './cn_voucher_manage_dao',
    '../constant/constant_cn_voucher',
    '../lib/wrapper/ns_wrapper_config',
    './cn_currency_dao',
    '../lib/wrapper/ns_wrapper_util'
],

function(runtime, search, helper, commons, periodDao, formatter, manageDao, constants, config, currencyDao, util) {

    var fetchParams = {};
    var approvers = {};
    var fetchApprovalInfoOnce = false;
    var operators = [];
    var supportedTranTypes = {};
    var currencies = {};

    var DEFAULT_ZERO = 0;
    var isOneWorldAccount = false;
    var multiCurrencyEnabled = false;
    /**
     * Stores employee Information. key is employee internalid, value is combined name.
     */
    var employeeInfo = {};

    /**
     * @desc fetch voucher by parameters.
     * @param {object} [params] - parameters.
     * @return {array} - array of transaction object including all required information.
     */
    function fetchVoucher(params) {
        log.debug('fetchVoucher', params);

        if (!commons.makesure(params))
            return;

        // Single Voucher Print in Journal Entry UI
        if (commons.isNumber(params) || commons.isString(params))
            fetchParams = {
                'id': params
            };
        else
            fetchParams = params;

        var vouchers = fetchData(fetchParams);

        return vouchers;
    }

    /**
     * @desc fetch vouchers by parameters.
     * @param {object} [params] - parameters.
     * @return voucher list result.
     */
    function fetchData(params) {
        log.debug("fetchData", params);
        isOneWorldAccount = runtime.isOW();
        multiCurrencyEnabled = runtime.isMultiCurrency();

        var dataList = [];

        // Check Query Start Time
        var queryStartTime = runtime.clock();

        var results = queryTransactionLines(params);

        // Check Query End Time
        var queryEndTime = runtime.clock();
        log.debug('fetchData > query > result ', results);
        log.audit('Time spent (ms) on Searching', queryEndTime - queryStartTime);
        log.audit('Number of lines returned', results.length);

        if (!commons.ensure(results)) {
            log.debug("fetchData", "No Data Found");
            return;
        }

        initializeSharedVariables(params, results[0].getValue(helper.column('subsidiary')));

        var preTrantype;
        var preInternalid;
        var transactionLines = [];
        var transactionLine;

        // Check Processing Start Time
        var processingStartTime = runtime.clock();
        log.audit('start processing results...', processingStartTime);

        for ( var index in results) {
            transactionLine = results[index];
            var trantype = transactionLine.getValue(helper.column('type'));
            var internalid = transactionLine.getValue(helper.column('internalid'));
            preTrantype = preTrantype || trantype;
            preInternalid = preInternalid || internalid;
            if (preTrantype !== trantype || preInternalid !== internalid) {
                dataList = dataList.concat(generateVouchers(processSingleTransaction(transactionLines)));
                transactionLines = [];
            }
            transactionLines.push(transactionLine);
            preTrantype = trantype;
            preInternalid = internalid;
        }
        log.debug('cn_voucher_dao > transactionLines ', transactionLines);
        if (commons.ensure(transactionLines)) {
            dataList = dataList.concat(generateVouchers(processSingleTransaction(transactionLines)));
        }

        // Check Processing End Time
        var processingEndTime = runtime.clock();
        log.audit('Time spent (ms) on Processing', processingEndTime - processingStartTime);
        log.audit('Number of transactions returned', dataList.length);

        log.debug("Results", dataList);
        return dataList;
    }

    function initializeSharedVariables(params, defaultSubsidiary) {
        currencies = {};
        operators = manageDao.queryOperators(fetchParams);
        supportedTranTypes = manageDao.querySupportedTranTypes();
        if (multiCurrencyEnabled) {
            fetchTransactionCurrency(params);
        }
        // Voucher print for single Journal Entry
        if (isOneWorldAccount && !commons.makesure(params.subsidiary)) {
            params.subsidiary = defaultSubsidiary;
        }
        fetchSubsidiaryCurrency(params);

        queryEmployeeInfo();
    }

    /**
     * From performance consideration, query employee record once even when some of/or most of the employee information are not necessary.
     */
    function queryEmployeeInfo() {
        employeeInfo = {};
        var employeeSearch = search.create({
            type: search.Type.EMPLOYEE,
            filters: [
                helper.filter('giveaccess').is('T'),
                helper.filter('isinactive').is('F')
            ],
            columns: [
                helper.column('firstname').create(),
                helper.column('middlename').create(),
                helper.column('lastname').create()
            ]
        });
        var results = helper.resultset(employeeSearch.run());
        for ( var index in results) {
            var result = results[index];
            employeeInfo[result.id] = formatUserName(result.getValue(helper.column('firstname')), result.getValue(helper.column('middlename')), result.getValue(helper.column('lastname')));
        }
    }

    /**
     * @desc Load saved search customsearch_voucher_print_search to search transaction lines that matches criteria.
     * @param {object} [params] - parameters.
     * @return query customsearch_voucher_print_search result.
     */
    function queryTransactionLines(params) {
        var savedSearch = search.load({
            id: 'customsearch_voucher_print_search'
        });
        savedSearch.filters = filters(params);

        if (commons.ensure(params.selectpage) && commons.ensure(params.transperpage)) {
            var internalids = paginationCriteria(params);
            if (commons.ensure(internalids)) {
                savedSearch.filters.push(helper.filter('internalid').anyof(internalids));
            }

        }
        log.debug('cn_voucher_dao.js > query: savedSearch.filters', savedSearch.filters);

        savedSearch.columns = columns(params);

        log.debug('cn_voucher_dao.js > query: savedSearch.columns', savedSearch.columns);
        return helper.resultset(savedSearch.run());
    }

    /**
     * @desc create filters by parameters.
     * @param {object} [params] - parameters.
     * @return {array} - voucher filters.
     */
    function filters(params) {
        var filters = [];
        filters.push(helper.filter('posting').is(true));
        // Filter lines such as 'End Group' move to matchIgnoreRow method
        filters.push(helper.filter('amount').isnotempty());
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
        if (runtime.isGLAuditNumbering() && commons.ensure(params.glnumber) && commons.ensure(params.glnumber.oper) && commons.ensure(params.glnumber.value)) {
            if ("is" === params.glnumber.oper)
                filters.push(helper.filter('glnumber').is(params.glnumber.value));
            else if ("startswith" === params.glnumber.oper)
                filters.push(helper.filter('glnumber').startswith(params.glnumber.value));
            else
                log.audit("Invalid GL # Operator", params.glnumber.oper);
        }
        log.debug("Filters", filters);
        return filters;
    }

    /**
     * @desc create columns by parameters.
     * @param {object} [params] - parameters.
     * @return {array} - column list.
     */
    function columns(params) {
        //Move glcolumn to first one to avoid sorting being changed by preceding columns
        var glcolumns = [];
        if (runtime.isGLAuditNumbering()) {
            glcolumns.push(helper.column('glnumber').asc().create());
        }

        var otherColumns = [
            helper.column('memo').create(),
            helper.column('account').create(),
            helper.column('exchangerate').create(),
            helper.column('amount').create(),
            helper.column('creditamount').create(),
            helper.column('debitamount').create(),
            helper.column('type').create(),
            helper.column('trandate').create(),
            helper.column('periodname').reference('accountingperiod').create(),
            helper.column('internalid').create(),
            helper.column('tranid').create(),
            helper.column('createdby').create()
        ];
        if (multiCurrencyEnabled) {
            otherColumns.push(helper.column('currency').create());
            otherColumns.push(helper.column('fxamount').create());
        }
        if (isOneWorldAccount) {
            otherColumns.push(helper.column('subsidiary').create());
            otherColumns.push(helper.column('namenohierarchy').reference('subsidiary').create());
            otherColumns.push(helper.column('currency').reference('subsidiary').create());
        }
        if (commons.makesure(params.location)) {
            otherColumns.push(helper.column('locationnohierarchy').create());
        }
        if (commons.makesure(params.department)) {
            otherColumns.push(helper.column('departmentnohierarchy').create());
        }
        if (commons.makesure(params.classes)) {
            otherColumns.push(helper.column('classnohierarchy').create());
        }
        return glcolumns.concat(otherColumns);
    }
    function isAllRowZeroAmount(results) {
        for (var i = 0; i < results.length; i++) {
            var amount = results[i].getValue(helper.column('amount'));
            if (commons.toNumber(amount) !== 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * set undefined credit or debit value to be zero for voucher print
     */
    function setUndefinedAmountToZero(debit, credit, rowIdx) {
        if (!commons.makesure(debit) && !commons.makesure(credit)) {
            if (rowIdx === 0) {
                debit = DEFAULT_ZERO;
            } else {
                credit = DEFAULT_ZERO;
            }
        }

        return {
            debit: debit,
            credit: credit
        };
    }

    function composeTotalValue(resultLines) {
        var fxDebitAmountTotal = 0;
        var fxCreditAmountTotal = 0;
        var debitAmountTotal = 0;
        var creditAmountTotal = 0;

        for (var idx = 0; idx < resultLines.length; idx++) {
            fxDebitAmountTotal += commons.toNormalizedNumber(resultLines[idx].fxDebitAmount);
            fxCreditAmountTotal += commons.toNormalizedNumber(resultLines[idx].fxCreditAmount);
            debitAmountTotal += commons.toNormalizedNumber(resultLines[idx].debitAmount);
            creditAmountTotal += commons.toNormalizedNumber(resultLines[idx].creditAmount);
        }

        return {
            fxDebitAmountTotal: fxDebitAmountTotal,
            fxCreditAmountTotal: fxCreditAmountTotal,
            debitAmountTotal: debitAmountTotal,
            creditAmountTotal: creditAmountTotal
        };
    }

    /**
     * Two scenarios to skip
     *  First: if some rows with undefined credit and debit amount but NOT all rows
     *  Second: End Group Row without any account name
     * @param isAllRowZeroAmount
     * @param debit
     * @param credit
     * @param account
     * @return {boolean} true - skip current row and vice versa
     */
    function matchIgnoreRow(isAllRowZeroAmount, debit, credit, account) {
        if (isAllRowZeroAmount) {
            return false;
        } else {
            if (!commons.makesure(account) || (!commons.makesure(debit) && !commons.makesure(credit))) {
                log.audit('matchIgnoreRow', 'matchIgnoreRow=T');
                return true;
            } else {
                return false;
            }
        }
    }

    /**
     * @desc Process one single transaction record:
     *       1. Keep all zero lines if transaction has zero amount. But if transaction amount is not zero, then ignore all zero amount lines.
     *       2. Process fxamount to show fxDebitAmount/fxCreditAmount
     *       3. Calculate total amounts, for example: fxDebitAmountTotal, fxCreditAmountTotal, etc.
     *       4. Append Creator/Approver/Poster
     * @param {array} [results] - results to be processed.
     * @return property value after processed.
     */
    function processSingleTransaction(results) {
        if (!commons.ensure(results)) {
            return;
        }

        var trankey = results[0].getValue(helper.column('type'));
        var trantype = trankey;
        if (supportedTranTypes.hasOwnProperty(trankey))
            trantype = supportedTranTypes[trankey];

        var currencyOfSubsidiary = currencies['subsidiary'];
        var currencyOfJournal = multiCurrencyEnabled ? currencies[results[0].getText(helper.column('currency'))] : currencyOfSubsidiary;
        var exchangeRate = formatter.normalize({
            num: results[0].getValue(helper.column('exchangerate'))
        });
        var subsidiary;
        if (!isOneWorldAccount) {
            subsidiary = config.getCompanyName();
        } else {
            subsidiary = results[0].getValue(helper.column('namenohierarchy').reference('subsidiary'));
        }
        var tranid = results[0].getValue(helper.column('tranid'));
        var trandate = results[0].getValue(helper.column('trandate'));
        var postingperiod = results[0].getValue(helper.column('periodname').reference('accountingperiod'));
        var glnumber = results[0].getValue(helper.column('glnumber'));
        if (!commons.ensure(glnumber)) {
            glnumber = '';
        }

        var origCreatedBy = getName(results[0].getValue(helper.column('createdby')), results[0].getText(helper.column('createdby')));

        var operatorsOfTransaction = getOperatorsOfTransaction({
            trantype: trankey,
            trandate: formatter.parseDate(trandate)
        });

        var createdBy = commons.ensure(operatorsOfTransaction[constants.CREATOR]) ? operatorsOfTransaction[constants.CREATOR] : origCreatedBy;
        var approvedBy = commons.ensure(operatorsOfTransaction[constants.APPROVER]) ? operatorsOfTransaction[constants.APPROVER] : getApprovedBy(tranid);

        var postedBy = operatorsOfTransaction[constants.POSTER];
        if (!commons.ensure(postedBy)) {
            if (commons.ensure(approvedBy)) {
                postedBy = approvedBy;
            } else {
                postedBy = createdBy;
            }
        }

        var lines = [];

        var _isAllRowZeroAmount = isAllRowZeroAmount(results);
        log.debug('process > results', JSON.stringify(results));
        for (var i = 0; i < results.length; i++) {
            var debitAmount = results[i].getValue(helper.column('debitamount'));
            var creditAmount = results[i].getValue(helper.column('creditamount'));
            // To filter out End Row
            var accountName = results[i].getValue(helper.column('account'));

            // Two scenarios to skip
            // First: if some rows with undefined credit and debit amount but NOT all rows
            // Second: End Group Row without any account name
            if (matchIgnoreRow(_isAllRowZeroAmount, debitAmount, creditAmount, accountName)) {
                continue;
            }

            var functionCcyDefaultValueObj = setUndefinedAmountToZero(debitAmount, creditAmount, i);
            debitAmount = functionCcyDefaultValueObj.debit;
            creditAmount = functionCcyDefaultValueObj.credit;

            var fxDebitAmount = commons.hasField(results[i], 'debitamount') ? (multiCurrencyEnabled ? commons.toAbsNumber(results[i].getValue(helper.column('fxamount'))) : debitAmount) : undefined;
            var fxCreditAmount = commons.hasField(results[i], 'creditamount') ? (multiCurrencyEnabled ? commons.toAbsNumber(results[i].getValue(helper.column('fxamount'))) : creditAmount) : undefined;
            var locationStr = commons.makesure(results[i].getText(helper.column('locationnohierarchy'))) ? results[i].getText(helper.column('locationnohierarchy')) : '';
            var departmentStr = commons.makesure(results[i].getText(helper.column('departmentnohierarchy'))) ? results[i].getText(helper.column('departmentnohierarchy')) : '';
            var classesStr = commons.makesure(results[i].getText(helper.column('classnohierarchy'))) ? results[i].getText(helper.column('classnohierarchy')) : '';
            var objTruncatedText = processLocAndDepAndClass(locationStr, departmentStr, classesStr);
            var objFullText = processLocAndDepAndClassFullText(locationStr, departmentStr, classesStr);
            var transCcyDefaultValueObj = setUndefinedAmountToZero(fxDebitAmount, fxCreditAmount, i);
            fxDebitAmount = transCcyDefaultValueObj.debit;
            fxCreditAmount = transCcyDefaultValueObj.credit;

            lines.push({
                memo: results[i].getValue(helper.column('memo')),
                account: results[i].getText(helper.column('account')),
                currency: currencyOfJournal,
                exchangeRate: exchangeRate,
                fxDebitAmount: fxDebitAmount,
                fxCreditAmount: fxCreditAmount,
                debitAmount: debitAmount,
                creditAmount: creditAmount,
                location: objTruncatedText.locationStr,
                department: objTruncatedText.departmentStr,
                classes: objTruncatedText.classesStr,
                locationFullText: objFullText.locationFullStr,
                departmentFullText: objFullText.departmentFullStr,
                classesFullText: objFullText.classesFullStr
            });
        }

        var totalObj = composeTotalValue(lines);
        return {
            trankey: trankey,
            trantype: trantype,
            currency: currencyOfSubsidiary,
            lines: lines,
            fxDebitAmountTotal: totalObj.fxDebitAmountTotal,
            fxCreditAmountTotal: totalObj.fxCreditAmountTotal,
            debitAmountTotal: totalObj.debitAmountTotal,
            creditAmountTotal: totalObj.creditAmountTotal,
            subsidiary: subsidiary,
            tranid: tranid,
            trandate: trandate,
            postingperiod: postingperiod,
            glnumber: glnumber,
            createdBy: createdBy,
            approvedBy: approvedBy,
            postBy: postedBy
        };
    }

    /**
     * @desc Generate required Voucher format for given transaction.
     *       1. Each Voucher has 8 lines which means transaction line will be splited every 8 lines.
     *       2. Each Voucher has header(subsidiary, currency, etc), lines, and footer(creator, approver, poster).
     *       3. For last Voucher, append empty lines if less than 8 lines.
     * @param {object} [rawTran] - raw transaction to be revised.
     * @return {array} - transaction after revised.
     */
    function generateVouchers(rawTran) {
        if (!commons.ensure(rawTran)) {
            return;
        }

        var revisedTran = [];

        var rawLines = rawTran.lines;
        var pageTotal = Math.ceil(rawLines.length / 8);
        var piecemealLineNum = rawLines.length % 8;

        for (var x = 0; x < pageTotal; x++) {
            var pagedTran = {};

            // header and footer
            pagedTran.trantype = rawTran.trantype;
            pagedTran.currency = rawTran.currency;
            pagedTran.subsidiary = rawTran.subsidiary;
            pagedTran.tranid = rawTran.tranid;
            pagedTran.postingperiod = rawTran.postingperiod;
            pagedTran.trandate = rawTran.trandate;
            pagedTran.glnumber = rawTran.glnumber;
            pagedTran.createdBy = rawTran.createdBy;
            pagedTran.approvedBy = rawTran.approvedBy;
            pagedTran.postBy = rawTran.postBy;

            pagedTran.fxDebitAmountTotal = '';
            pagedTran.fxCreditAmountTotal = '';
            pagedTran.debitAmountTotal = '';
            pagedTran.creditAmountTotal = '';

            pagedTran.pageNum = x + 1;
            pagedTran.pageTotal = pageTotal;

            // lines
            var revisedLines = [];
            var linesPerPage = 8;
            if ((x + 1) === pageTotal && piecemealLineNum !== 0) {
                linesPerPage = piecemealLineNum;
            }
            for (var i = 0; i < linesPerPage; i++) {
                revisedLines[i] = {};
                revisedLines[i].lineNum = x * 8 + i + 1;
                revisedLines[i].memo = rawLines[x * 8 + i].memo;
                revisedLines[i].account = rawLines[x * 8 + i].account;
                revisedLines[i].currency = rawLines[x * 8 + i].currency;
                revisedLines[i].exchangeRate = rawLines[x * 8 + i].exchangeRate;
                revisedLines[i].location = rawLines[x * 8 + i].location;
                revisedLines[i].department = rawLines[x * 8 + i].department;
                revisedLines[i].classes = rawLines[x * 8 + i].classes;
                revisedLines[i].locationFullText = rawLines[x * 8 + i].locationFullText;
                revisedLines[i].departmentFullText = rawLines[x * 8 + i].departmentFullText;
                revisedLines[i].classesFullText = rawLines[x * 8 + i].classesFullText;
                revisedLines[i].fxDebitAmount = formatter.formatCurrency(rawLines[x * 8 + i].fxDebitAmount);
                revisedLines[i].fxCreditAmount = formatter.formatCurrency(rawLines[x * 8 + i].fxCreditAmount);
                revisedLines[i].debitAmount = formatter.formatCurrency(rawLines[x * 8 + i].debitAmount);
                revisedLines[i].creditAmount = formatter.formatCurrency(rawLines[x * 8 + i].creditAmount);
            }
            // lines: append blank lines
            if ((x + 1) === pageTotal) {
                pagedTran.fxDebitAmountTotal = formatter.formatCurrency(rawTran.fxDebitAmountTotal);
                pagedTran.fxCreditAmountTotal = formatter.formatCurrency(rawTran.fxCreditAmountTotal);
                pagedTran.debitAmountTotal = formatter.formatCurrency(rawTran.debitAmountTotal);
                pagedTran.creditAmountTotal = formatter.formatCurrency(rawTran.creditAmountTotal);

                if (piecemealLineNum !== 0) {
                    for (var i = piecemealLineNum; i < 8; i++) {
                        revisedLines[i] = {};
                        revisedLines[i].lineNum = '';
                        revisedLines[i].memo = '';
                        revisedLines[i].account = '';
                        revisedLines[i].currency = '';
                        revisedLines[i].exchangeRate = '';
                        revisedLines[i].location = '';
                        revisedLines[i].department = '';
                        revisedLines[i].classes = '';
                        revisedLines[i].locationFullText = '';
                        revisedLines[i].departmentFullText = '';
                        revisedLines[i].classesFullText = '';
                        revisedLines[i].fxDebitAmount = '';
                        revisedLines[i].fxCreditAmount = '';
                        revisedLines[i].debitAmount = '';
                        revisedLines[i].creditAmount = '';
                    }
                }
            }
            pagedTran.lines = revisedLines;

            // collect paged transactions
            revisedTran.push(pagedTran);
        }

        log.debug("Revised transaction", revisedTran);
        return revisedTran;
    }

    /**
     * @desc Give priority to creator, approver and poster.
     * @param {Object} transParams - parameters of one transaction
     *  trantype, trandate
     * @returns {Object} Object containing creator, approver and poster.
     */
    function getOperatorsOfTransaction(transParams) {
        var operatorOfTran = {};

        for ( var index in operators) {
            var oneRecord = operators[index];
            var trantype = oneRecord.getValue(helper.column('custrecord_cn_voucher_trantypes_type').reference('custrecord_transaction_type'));
            var startDate = formatter.parseDate(oneRecord.getValue(helper.column('custrecord_start_date')));
            var endDate = oneRecord.getValue(helper.column('custrecord_end_date'));
            var type = oneRecord.getValue(helper.column('custrecord_type'));
            var user = getName(oneRecord.getValue(helper.column('custrecord_user')), oneRecord.getText(helper.column('custrecord_user')));

            if (transParams.trandate.getTime() >= startDate.getTime() && (!commons.makesure(endDate) || transParams.trandate.getTime() <= formatter.parseDate(endDate).getTime())) {
                if ((supportedTranTypes.hasOwnProperty(transParams.trantype) && trantype === transParams.trantype) || (!supportedTranTypes.hasOwnProperty(transParams.trantype) && trantype === constants.TRANSACTION_TYPE_OTHER)) {
                    operatorOfTran[type] = user;
                }
            }

            if (Object.keys(operatorOfTran).length === 3) {
                break;
            }
        }

        return operatorOfTran;
    }

    /**
     * @desc Get transaction real approver.
     *       The query will be deferred to only when we cannot get approver from Voucher Setup UI.
     *       The query will be executed for one time to get name from system notes.
     * @param {number} [tranid] - transaction id.
     * @return approvers.
     */
    function getApprovedBy(tranid) {
        if (!commons.makesure(tranid)) {
            return;
        }

        if (!fetchApprovalInfoOnce) {
            var columnTranid = helper.column('tranid').group().asc().create();
            var columnName = helper.column('name').reference('systemnotes').group().create();

            // When user approves in English, the approval code stored is in English
            // When user approves in Chinese, the approval code stored is in Chinese
            var approvalCodeEN = 'Approved for Posting';
            var results = queryApprovedBy(approvalCodeEN);
            log.debug('cn_voucher_dao.js > approvedby: results', results);

            for ( var i in results) {
                approvers[results[i].getValue(columnTranid)] = getName(results[i].getValue(columnName), results[i].getText(columnName));
            }

            var approvalCodeCN = '\u5df2\u6838\u51c6\u8fc7\u8d26';
            results = queryApprovedBy(approvalCodeCN);
            log.debug('cn_voucher_dao.js > approvedby: results', results);

            for ( var i in results) {
                approvers[results[i].getValue(columnTranid)] = getName(results[i].getValue(columnName), results[i].getText(columnName));
            }

            fetchApprovalInfoOnce = true;
        }

        log.debug('cn_voucher_dao.js > approvedby: approvers', approvers);
        return approvers[tranid];
    }

    function getName(employeeId, defaultName) {
        var name = defaultName;
        if (employeeId && employeeInfo[employeeId]) {
            name = employeeInfo[employeeId];
        }
        return name;
    }

    /**
     * Query transaction real approved by employee.
     * If customer enabled Approvals in the account, then for real Transaction Approval, there will be one system notes for approved record.
     */
    function queryApprovedBy(approveCode) {
        var columnTranid = helper.column('tranid').group().asc().create();
        var columnName = helper.column('name').reference('systemnotes').group().create();
        var columnDate = helper.column('date').reference('systemnotes').max().asc().create();
        return helper.resultset(search.create({
            type: search.Type.TRANSACTION,
            columns: [
                columnTranid,
                columnName,
                columnDate
            ],
            filters: function() {
                var f = filters(fetchParams);
                f.push(helper.filter('newvalue').reference('systemnotes').is(approveCode));
                return f;
            }()
        }).run());
    }

    /**
     * @desc Get transaction total page.
     * @param {Object} [params] - Parameters collected from user inputs.
     * @return {Number} total page count.
     */
    function getTransactionTotalPage(params) {
        var transCountColumn = search.createColumn({
            name: 'internalid',
            summary: search.Summary.COUNT
        });

        var columnsCount = [
            transCountColumn
        ];

        var filtersCount = filters(params);
        filtersCount.push(helper.filter('mainline').is('T'));

        var searchCount = search.create({
            type: search.Type.TRANSACTION,
            columns: columnsCount,
            filters: filtersCount
        });

        var searchResult = searchCount.run().getRange(0, 1);
        if (!commons.ensure(searchResult))
            return 0;

        var totalCount = searchResult[0].getValue({
            name: 'internalid',
            summary: search.Summary.COUNT
        });

        return Math.ceil(totalCount / params.transperpage);
    }

    /**
     * @desc get internalIds by criteria.
     * @param {object} [params] - parameters.
     * @return {array} internalids.
     */
    function paginationCriteria(params) {

        var selectpage = params.selectpage;
        var transactionsperpage = params.transperpage;

        var filtersInternalids = filters(params);
        filtersInternalids.push(helper.filter('mainline').is('T'));
        log.debug('cn_voucher_dao.js > paginationCriteria: filtersInternalids', filtersInternalids);

        var columnsGroups = [];
        if (runtime.isGLAuditNumbering()) {
            columnsGroups.push(helper.column('glnumber').group().asc().create());
        }
        columnsGroups.push(helper.column('type').group().create());
        columnsGroups.push(helper.column('internalid').group().asc().create());
        columnsGroups.push(helper.column('line').max().asc().create());

        //this is to get internalids which should be added in the criteria
        var internalIdSearch = search.create({
            type: search.Type.TRANSACTION,
            filters: filtersInternalids,
            columns: columnsGroups
        });

        var results = internalIdSearch.run().getRange({
            start: (selectpage - 1) * transactionsperpage,
            end: selectpage * transactionsperpage
        });

        log.debug('cn_voucher_dao.js > paginationCriteria: results', results);

        if (!commons.ensure(results)) {
            return null;
        } else {

            var internalids = [];
            for ( var i in results) {
                internalids[i] = results[i].getValue({
                    name: 'internalid',
                    summary: search.Summary.GROUP
                });
            }

            //make a criteria

            log.debug('cn_voucher_dao.js > paginationCriteria: internalids', internalids);

            return internalids;
        }
    }

    /**
     * @desc Get transaction currencies.
     * @param {Object} [params] - Parameters collected from user inputs.
     */
    function fetchTransactionCurrency(params) {
        var currency = search.createColumn({
            name: 'currency',
            summary: search.Summary.GROUP
        });

        var columnsCurrency = [
            currency
        ];

        var filtersCurrency = filters(params);

        var searchCurrency = search.create({
            type: search.Type.TRANSACTION,
            columns: columnsCurrency,
            filters: filtersCurrency
        });
        var currencyResults = helper.resultset(searchCurrency.run());
        var currencyIds = currencyResults.map(function(currency) {
            return currency.getValue({
                name: 'currency',
                summary: search.Summary.GROUP
            });
        });
        util.extend(currencies, currencyDao.fetchCurrencyNamesAndCodes(currencyIds));
    }

    /**
     * @desc Get subsidiary currencies.
     * @param {Object} [params] - Parameters collected from user inputs.
     */
    function fetchSubsidiaryCurrency(params) {
        var subsidiaryCurrencies = {
            'subsidiary': config.getCurrency({
                subsidiaryId: params.subsidiary
            }).code
        };
        util.extend(currencies, subsidiaryCurrencies);
    }

    /**
     * @desc process location department class truncated
     * @param {Object} [params] - locationStr
     * @param {Object} [params] - departmentStr
     * @param {Object} [params] - classesStr
     */
    function processLocAndDepAndClass(locationStr, departmentStr, classesStr) {
        var locAndDepAndClass = locationStr + departmentStr + classesStr;
        if (locAndDepAndClass.length > 25) {
            if (locationStr.length > 7 && commons.makesure(locationStr)) {
                locationStr = locationStr.substring(0, 6) + "...";
            }
            if (departmentStr.length > 7 && commons.makesure(departmentStr)) {
                departmentStr = departmentStr.substring(0, 6) + "...";
            }
            if (classesStr.length > 7 && commons.makesure(classesStr)) {
                classesStr = classesStr.substring(0, 6) + "...";
            }
        }

        if (commons.makesure(locationStr) && (commons.makesure(departmentStr) || commons.makesure(classesStr))) {
            locationStr = locationStr + '/'
        }
        if (commons.makesure(departmentStr) && commons.makesure(classesStr)) {
            departmentStr = departmentStr + '/'
        }
        return {
            locationStr: locationStr,
            departmentStr: departmentStr,
            classesStr: classesStr
        }
    }

    /**
     * @desc process location department class no truncated
     * @param {Object} [params] - locationStr
     * @param {Object} [params] - departmentStr
     * @param {Object} [params] - classesStr
     */
    function processLocAndDepAndClassFullText(locationStr, departmentStr, classesStr) {
        if (commons.makesure(locationStr) && (commons.makesure(departmentStr) || commons.makesure(classesStr))) {
            locationStr = locationStr + '/'
        }
        if (commons.makesure(departmentStr) && commons.makesure(classesStr)) {
            departmentStr = departmentStr + '/'
        }

        return {
            locationFullStr: locationStr,
            departmentFullStr: departmentStr,
            classesFullStr: classesStr
        }
    }

    /**
     * Follow Chinese naming habit(lastName + middleName + firstName) when the names contains Chinese characters only.
     */
    function formatUserName(first, middle, last) {
        var firstName = first || '';
        var middleName = middle || '';
        var lastName = last || '';
        var hasCJK = commons.isCJKUnifiedIdeographs(lastName.trim() + middleName.trim() + firstName.trim());
        log.debug('formatUserName', 'hasCJK=' + hasCJK + ', firstName=' + firstName + ', lastName=' + lastName);
        if (hasCJK) {
            return lastName + middleName + firstName;
        } else {
            return firstName + (middleName ? ' ' + middleName : '') + (lastName ? ' ' + lastName : '');
        }
    }

    return {
        fetchVoucher: fetchVoucher,
        getTransactionTotalPage: getTransactionTotalPage
    };

});
