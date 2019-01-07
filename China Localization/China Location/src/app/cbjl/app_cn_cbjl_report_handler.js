/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */

define([
    '../../lib/wrapper/ns_wrapper_record',
    '../../res/cbjl/cbjlresource',
    '../../lib/commons',
    '../../lib/wrapper/ns_wrapper_encode',
    '../../lib/wrapper/ns_wrapper_url',
    '../../lib/wrapper/ns_wrapper_https',
    '../../lib/wrapper/ns_wrapper_format',
    '../../lib/wrapper/ns_wrapper_config',
    '../../dao/cn_extended_report_dao',
    '../../dao/cn_cross_period_checker',
    '../../constant/constant_cn_cbjl',
    '../../../lib/math.min',
    '../../../lib/date-zh-CN',
    '../../lib/letsdoauth'
],
function (record, resource, commons, encode, url, https, formatter, config, reportDao, periodChecker, constant, math, date, letsdoauth) {

    var labels = resource.load(resource.Name.Labels);
    var crossChecker;

    function getReportData(params, reportDataId) {
        var reportDataObj = getCachedReportData(commons.isString(reportDataId) ? JSON.parse(reportDataId) : reportDataId);
        var filter = params.filter, format = params.format;
        var type = 'cbjl';
        var rows = handleCachedReportData(reportDataObj, filter, type, format);
        var reportData = returnReportData(filter,rows, format);
        log.debug('app_cn_cbjl_report_handler:getReportData', 'reportData result: ' + JSON.stringify(reportData));
        return reportData;
    }
    function returnReportData(filter,rows, format){
        return {
            title: labels.ReportTitle,
            subsidiary: {
                name: labels.Subsidiary + labels.Colon,
                value: getSubsidiary(filter.subsidiary)
            },
            date: {
                from: {
                    name: '',
                    value: filter.date.from.name.trim()
                },
                to: {
                    name: '',
                    value: filter.date.to.name.trim()
                }
            },
            currency: {
                name: labels.Currency,
                value: getCurrency(filter.subsidiary)
            },
            account: {
                name: labels.Account + labels.Colon
            },
            location: {
                name: labels.Location + labels.Colon,
                value: filter.location.name
            },
            department: {
                name: labels.Department + labels.Colon,
                value: filter.department.name
            },
            clasz: {
                name: labels.Clasz + labels.Colon,
                value: filter.clasz.name
            },
            body: getReportBody(rows, format),
            printBy: {
                name: labels.PrintBy,
                value: reportDao.getPrintBy()
            },
            printTime: {
                name: labels.PrintTime,
                value: formatter.formatDateTime(new Date())
            },
            page: {
                name: labels.Page
            }
        };
    }

    function getSubsidiary(subsidiary) {
        if (commons.ensure(subsidiary.id)) {
            return subsidiary.name.trim();
        }
        return config.getCompanyName();
    }

    function getCurrency(subsidiary) {      
        return config.getCurrency({
            subsidiaryId: getRealSubsidiaryId(subsidiary)
        }).code;
    }
    
    /**
     * get original subsidiary id from subsidiary filter
     * @return if subsidiary.id is Array, then it is consolidated, return array[1]
     * else return subsidiary.id
     */
    function getRealSubsidiaryId(subsidiary){
        var subsidiaryId = commons.ensure(subsidiary) ? subsidiary.id : null;
        subsidiaryId = commons.makesure(subsidiaryId) && commons.isArray(JSON.parse(subsidiaryId)) ? JSON.parse(subsidiaryId)[1] : subsidiaryId;
        return subsidiaryId;
    }

    function getCachedReportData(reportDataId) {
        var reportData = reportDao.getGlReportDataByIds(reportDataId);
        var resultString = '';
        for (var i = 0; i < reportData.length; i++) {
            resultString += reportData[i].getValue('custrecord_cn_gl_reportdata');
        }
        return JSON.parse(encode.convert({
            string: resultString,
            inputEncoding: encode.Encoding.BASE_64,
            outputEncoding: encode.Encoding.UTF_8
        }));
    }

    function getReportBody(rows, format) {
        var reportBody = {
            columnAccountName: labels.Account,
            columnDateName: labels.Date,
            columnTypeName: labels.Type,
            columnMemoName: labels.Memo,
            columnDocumentNumberName: labels.DocumentNumber,
            columnPaymentMethodName: labels.PaymentMethod,
            columnGLNumberName: labels.GLNumber,
            columnDebitName: labels.DebitAmount,
            columnCreditName: labels.CreditAmount,
            columnBalanceName: labels.ClosingBalance,
            columnDirectionName: labels.BalanceDirection,
            columnAmountName: labels.BalanceAmount
        };
        if (format === constant.FORMAT_PDF) {
            reportBody.pages = rows;
        } else {
            reportBody.rows = rows;
        }
        return reportBody;
    }

    function handleCachedReportData(reportData, filter, type, format) {
        var rows = [];
        var subsidiaryFilter = {
            id: getRealSubsidiaryId(filter.subsidiary),
        };
        var monthlyPeriods = reportDao.queryMonthlyPeriodForDate(filter.date.from.name, filter.date.to.name, subsidiaryFilter);
        crossChecker = periodChecker.data(subsidiaryFilter.id);

        if (commons.makesure(monthlyPeriods)) {
            for (var i = 0; i < reportData.length; i++) {
                var accountRows = [];
                var accountEntry = reportData[i];

                addOpeningBalanceRow(accountEntry, accountRows);
                addTransactionMonthlyYearlyRows(accountEntry, accountRows, monthlyPeriods);
                addClosingBalanceRow(accountEntry, accountRows, format);
                if (format === constant.FORMAT_PDF) {
                    rows.push({
                        account: accountEntry.account,
                        rows: accountRows
                    });
                } else {
                    rows = rows.concat(accountRows);
                }
            }
        }
        return rows;
    }


    function addOpeningBalanceRow(accountEntry, rows) {
        rows.push({
            account: accountEntry.account,
            type: labels.OpeningBalance,
            balance: {
                direction: direction(accountEntry.opening),
                amount: formatter.formatCurrency(commons.toAbsNumber(accountEntry.opening))
            },
            istotal: true
        });
    }

    function addClosingBalanceRow(accountEntry, rows, format) {
        var closing = math.bignumber(commons.toNormalizedNumber(accountEntry.closing));
        var credit = math.bignumber(commons.toNormalizedNumber(accountEntry.credit));
        var opening = math.bignumber(commons.toNormalizedNumber(accountEntry.opening));
        var debit = math.subtract(math.add(closing, credit), opening);
        rows.push({
            account: labels.Total + ' - ' + accountEntry.account,
            type: format === constant.FORMAT_PDF ? labels.Total : undefined,
            debit: formatter.formatCurrency(commons.toAbsNumber(debit)),
            credit: formatter.formatCurrency(commons.toAbsNumber(credit)),
            balance: {
                direction: direction(closing),
                amount: formatter.formatCurrency(commons.toAbsNumber(closing))
            },
            istotal: true
        });
    }

    function addTransactionMonthlyYearlyRows(accountEntry, rows, monthlyPeriods) {
        var periodIndex = 0, tranIndex = 0, monthlyStartIndex = 0, dailyStartIndex = 0,yearlyStartIndex = 0;

        var tranEntries = accountEntry.children;
        var lastDate = null;

        for (; periodIndex < monthlyPeriods.length; periodIndex++) {
            var monthlyPeriod = monthlyPeriods[periodIndex];
            if (commons.makesure(tranEntries)) {
                lastDate = tranEntries[tranIndex].date;
            }
            while (tranIndex < tranEntries.length) {
                var thisDate = Date.parse(tranEntries[tranIndex].date);
                var previousDate = Date.parse(lastDate);

                if (shouldAddDailyRow(thisDate, previousDate)) {
                    addDailyTotalRow({
                        type: labels.DailyTotal,
                        startIndex: dailyStartIndex,
                        endIndex: tranIndex,
                        tranEntries: tranEntries,
                        balance: getBalance(accountEntry, tranIndex),
                        date: lastDate
                    }, rows);

                    dailyStartIndex = tranIndex;
                    lastDate = tranEntries[tranIndex].date;
                }

                else if (shouldAddMonthlyRow(tranEntries[tranIndex].date, monthlyPeriod)) {

                    addMonthlyYearlyTotalRow({
                        type: labels.MonthlyTotal,
                        startIndex: monthlyStartIndex,
                        endIndex: tranIndex,
                        tranEntries: tranEntries,
                        balance: getBalance(accountEntry, tranIndex),
                        date: monthlyPeriod.enddate
                    }, rows);
                    monthlyStartIndex = tranIndex;
                    if (shouldAddYearlyRow(monthlyPeriod, monthlyPeriods[periodIndex + 1])) {
                        addMonthlyYearlyTotalRow({
                            type: labels.YearlyTotal,
                            startIndex: yearlyStartIndex,
                            endIndex: tranIndex,
                            tranEntries: tranEntries,
                            balance: getBalance(accountEntry, tranIndex),
                            date: monthlyPeriod.enddate
                        }, rows);
                        yearlyStartIndex = tranIndex;
                    }
                    break;
                }
                else {

                    addTransactionRow(tranEntries[tranIndex], rows);
                    lastDate = tranEntries[tranIndex].date;
                    tranIndex++;
                }
            }
            if (tranIndex === tranEntries.length) {


                break;
            }
        }
        handleLastPeriods({
            accountEntry: accountEntry,
            leftPeriods: monthlyPeriods.slice(periodIndex),
            dailyStartIndex: dailyStartIndex,
            dailyEndIndex: tranIndex,
            startIndex: monthlyStartIndex,
            endIndex: tranIndex,
            yearlyStartIndex: yearlyStartIndex,
            balance: getBalance(accountEntry, tranIndex),
            endTranDate: lastDate,
            rows: rows
        });
    }

    function shouldAddDailyRow(date, lastDate) {

        return date > lastDate;

    }

    function shouldAddMonthlyRow(date, monthlyPeriod) {

        return Date.parse(date) > formatter.parseDate(monthlyPeriod.enddate);

    }

    function shouldAddYearlyRow(preMonthlyPeriod, nextMonthlyPeriod) {
        return crossChecker.isCrossYear(formatter.parseDate(preMonthlyPeriod.enddate), formatter.parseDate(nextMonthlyPeriod.startdate));
    }

    function addTransactionRow(tranEntry, rows) {
        rows.push({
            type: tranEntry.type,
            documentNumber: commons.makesure(tranEntry.docnum) ? tranEntry.docnum : labels.DocNumberNull,
            internalid: tranEntry.internalid,
            trannum: tranEntry.trannum,
            glNumber: tranEntry.glnum,
            date: formatter.formatDate(Date.parse(tranEntry.date)),
            memo: tranEntry.memo,
            paymentMethod: tranEntry.paymethod,
            debit: commons.ensure(tranEntry.debit) ? formatter.formatCurrency(commons.toAbsNumber(tranEntry.debit)) : undefined,
            credit: commons.ensure(tranEntry.credit) ? formatter.formatCurrency(commons.toAbsNumber(tranEntry.credit)) : undefined,
            balance: {
                direction: direction(tranEntry.balance),
                amount: formatter.formatCurrency(commons.toAbsNumber(tranEntry.balance))
            }
        });
    }

    function addDailyTotalRow(params, rows) {
        var totalDebit = 0, totalCredit = 0;

        if (params.endIndex > 0 && commons.ensure(params.tranEntries) && params.tranEntries.length > 0) {
            for (var i = params.startIndex; i < params.endIndex; i++) {
                var tranDebit = math.bignumber(commons.toNormalizedNumber(params.tranEntries[i].debit));
                var tranCredit = math.bignumber(commons.toNormalizedNumber(params.tranEntries[i].credit));
                totalCredit = math.add(totalCredit, tranCredit);
                totalDebit = math.add(totalDebit, tranDebit);
            }
            rows.push({
                type: params.type,
                date: formatter.formatDate(Date.parse(params.date)),
                debit: formatter.formatCurrency(commons.toAbsNumber(totalDebit)),
                credit: formatter.formatCurrency(commons.toAbsNumber(totalCredit)),
                balance: {
                    direction: direction(params.balance),
                    amount: formatter.formatCurrency(commons.toAbsNumber(params.balance))
                },
                istotal: true
            });
        }

    }

    function addMonthlyYearlyTotalRow(params, rows) {
        var totalDebit = 0, totalCredit = 0;
        for (var i = params.startIndex; i < params.endIndex; i++) {
            var tranDebit = math.bignumber(commons.toNormalizedNumber(params.tranEntries[i].debit));
            var tranCredit = math.bignumber(commons.toNormalizedNumber(params.tranEntries[i].credit));
            totalCredit = math.add(totalCredit, tranCredit);
            totalDebit = math.add(totalDebit, tranDebit);
        }
        rows.push({
            type: params.type,
            date: params.date,
            debit: formatter.formatCurrency(commons.toAbsNumber(totalDebit)),
            credit: formatter.formatCurrency(commons.toAbsNumber(totalCredit)),
            balance: {
                direction: direction(params.balance),
                amount: formatter.formatCurrency(commons.toAbsNumber(params.balance))
            },
            istotal: true
        });
    }

    function getBalance(accountEntry, tranIndex) {
        return !commons.ensure(tranIndex) ? commons.toNormalizedNumber(accountEntry.opening) :
        commons.toNormalizedNumber(accountEntry.children[tranIndex - 1].balance);
    }

    function handleLastPeriods(params) {


        var leftPeriods = params.leftPeriods, lastMonthHasTrans = true, lastYearHasTrans = true;
        if (commons.makesure(params.accountEntry.children)) {
            //add the daily total of the last transaction
            addDailyTotalRow({
                type: labels.DailyTotal,
                endIndex: params.dailyEndIndex,
                startIndex: params.dailyStartIndex,
                tranEntries: params.accountEntry.children,
                balance: params.balance,
                date: params.endTranDate
            }, params.rows);
        }

        for (var i = 0; i < leftPeriods.length; i++) {
            addMonthlyYearlyTotalRow({
                type: labels.MonthlyTotal,
                startIndex: lastMonthHasTrans ? params.startIndex : 0,
                endIndex: lastMonthHasTrans ? params.endIndex : 0,
                date: leftPeriods[i].enddate,
                tranEntries: params.accountEntry.children,
                balance: params.balance
            }, params.rows);

            if (i === leftPeriods.length - 1 || shouldAddYearlyRow(leftPeriods[i], leftPeriods[i + 1])) {
                addMonthlyYearlyTotalRow({
                    type: labels.YearlyTotal,
                    startIndex: lastYearHasTrans ? params.yearlyStartIndex : 0,
                    endIndex: lastYearHasTrans ? params.endIndex : 0,
                    date: leftPeriods[i].enddate,
                    tranEntries: params.accountEntry.children,
                    balance: params.balance
                }, params.rows);
                lastYearHasTrans = false;
            }
            lastMonthHasTrans = false;
        }
    }

    function direction(amount) {
        switch (commons.sign(amount)) {
            case 1:
                return labels.Debit;
            case -1:
                return labels.Credit;
            case 0:
            default:
                return labels.Balance;
        }
    }

    function auth(authInfo, hashFunction) {
        var that = this;

        function getReportData(params) {
            params.filter.accountlevel = 'onlylast';
            var rlURL = url.resolveScript({
                scriptId: 'customscript_rl_cn_run_gl_report',
                deploymentId: 'customdeploy_rl_cn_run_gl_report',
                returnExternalUrl: true,
                params: {
                    type: 'cbjl',
                    filter: JSON.stringify(params.filter)
                }
            });
            authInfo.url = rlURL;
            authInfo.method = 'GET';
            log.debug('app_cn_cbjl_report_handler.js: Authorization', 'authInfo=' + JSON.stringify(authInfo) + ' hashFunction=' + hashFunction);

            var response = https.get({
                url: rlURL,
                headers: {
                    'Authorization': authInfo.isoauth ? letsdoauth.oAuth(authInfo, hashFunction) : letsdoauth.basicAuth(authInfo)
                }
            });
            log.debug('app_cn_cbjl_report_handler.js: auth.getReportData', 'response ' + response.body);

            var responseObj = JSON.parse(response.body);
            return that.getReportData(params, responseObj.reportDataId);
        }

        return {
            getReportData: getReportData
        };
    }

    return {
        getReportData: getReportData,
        auth: auth
    };

});
