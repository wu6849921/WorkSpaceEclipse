/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * For China Cash Flow Statement solution, need read below values from standard reports.
 *      Effective of foreign exchange rate changes on cash and cash equivalents
 *      Beginning balance of cash and cash equivalents
 *      Ending balance of cash and cash equivalents
 *      
 * And rl_cn_run_cashflow_reports is used to run those reports using nlapiRunReport API.
 * 
 * Params
 *      subsidiary      - mandatory for One-World account, will throw error if it is One-World account and subsidiary is not given
 *      fiscalCalendar  - mandatory if it is One-World account and Multi-Calendar feature has been enabled
 *      periodFrom      - mandatory
 *      periodTo        - mandatory
 *      location        - optional
 *      department      - optional
 *      classification  - optional
 * 
 * Return
 * String representative of below json object.
 * {
        unrealizedGainAndLossCurrent: 0,
        unrealizedGainAndLossPrior: 0,
        startBalanceCurrent: 0,
        startBalancePrior: 0,
        endBalanceCurrent: 0,
        endBalancePrior: 0
   }
 */
if (!cn) {
    var cn = {};
}
cn.rlv1 = cn.rlv1 || {};
cn.rlv1.fin = cn.rlv1.fin || {};
cn.rlv1.fin.standard = cn.rlv1.fin.standard || {};
cn.rlv1.fin.standard.reports = cn.rlv1.fin.standard.reports || {};

cn.rlv1.fin.standard.reports = function() {
    var isOW;
    var reportByPeriod;
    var generalLedgerColumnName;
    var unrealizedGainAndLossColumnName;

    this.doGet = function(params) {
        isOW = isOW();
        var paramsObj = validateParams(params);

        // check language, etc
        var langPref = getUserLanguage();
        nlapiLogExecution('DEBUG', 'doGet', 'langPref=' + langPref);
        if (langPref === 'zh_CN') {
            generalLedgerColumnName = '\u4f59\u989d';
            unrealizedGainAndLossColumnName = '\u51c0\u635f\u76ca';
        } else {
            generalLedgerColumnName = 'Balance';
            unrealizedGainAndLossColumnName = 'Net Gain/Loss';
        }

        // Reference getPeriod comments for the structure of periodObj
        var periodObj = getPeriod(paramsObj.periodFrom, paramsObj.periodTo, paramsObj.fiscalCalendar);

        var rtn = {
            unrealizedGainAndLossCurrent: 0,
            unrealizedGainAndLossPrior: 0,
            startBalanceCurrent: 0,
            startBalancePrior: 0,
            endBalanceCurrent: 0,
            endBalancePrior: 0
        };

        // If multi-currency does not enabled, then there won't be any unrealized exchange rate gains and losses
        if (isMultiCurrencyEnabled()) {
            // line 35, Effective of foreign exchange rate changes on cash and cash equivalents - Current Period
            rtn.unrealizedGainAndLossCurrent = runUnrealizedGainsAndLossesReport({
                'subsidiary': paramsObj.subsidiary,
                'periodFrom': paramsObj.periodFrom,
                'periodTo': paramsObj.periodTo
            });

            // line 35, Effective of foreign exchange rate changes on cash and cash equivalents - Prior Period
            // It might happen that periodFrom.samePeriodLastFiscalYear does not exist, but periodTo.samePeriodLastFiscalYear exists
            if (periodObj.periodTo.samePeriodLastFiscalYear.id) {
                if (periodObj.periodFrom.samePeriodLastFiscalYear.id) {
                    rtn.unrealizedGainAndLossPrior = runUnrealizedGainsAndLossesReport({
                        'subsidiary': paramsObj.subsidiary,
                        'periodFrom': periodObj.periodFrom.samePeriodLastFiscalYear.id,
                        'periodTo': periodObj.periodTo.samePeriodLastFiscalYear.id
                    });
                } else {
                    var from = getEarliestPeriod(fiscalCalendar, periodObj.periodFrom.samePeriodLastFiscalYear.startdate, periodObj.periodTo.samePeriodLastFiscalYear.startdate);
                    nlapiLogExecution('AUDIT', 'doGet', 'from=' + from);
                    rtn.unrealizedGainAndLossPrior = runUnrealizedGainsAndLossesReport({
                        'subsidiary': paramsObj.subsidiary,
                        'periodFrom': from,
                        'periodTo': periodObj.periodTo.samePeriodLastFiscalYear.id
                    });
                }
            }
        }

        // line 37, Beginning balance of cash and cash equivalents - Current Period
        if (periodObj.periodFrom.lastPeriod.id) {
            rtn.startBalanceCurrent = runGeneralLedgerReport({
                'subsidiary': paramsObj.subsidiary,
                'periodFrom': periodObj.periodFrom.lastPeriod.id,
                'periodTo': periodObj.periodFrom.lastPeriod.id
            });
        }

        // line 37, Beginning balance of cash and cash equivalents - Prior Period
        if (periodObj.periodFrom.lastPeriodOneFiscalYearAgo.id) {
            rtn.startBalancePrior = runGeneralLedgerReport({
                'subsidiary': paramsObj.subsidiary,
                'periodFrom': periodObj.periodFrom.lastPeriodOneFiscalYearAgo.id,
                'periodTo': periodObj.periodFrom.lastPeriodOneFiscalYearAgo.id
            });
        }

        // line 38, Ending balance of cash and cash equivalents - Current Period
        rtn.endBalanceCurrent = runGeneralLedgerReport({
            'subsidiary': paramsObj.subsidiary,
            'periodFrom': paramsObj.periodTo,
            'periodTo': paramsObj.periodTo
        });

        // line 38, Ending balance of cash and cash equivalents - Prior Period
        if (periodObj.periodTo.samePeriodLastFiscalYear.id) {
            rtn.endBalancePrior = runGeneralLedgerReport({
                'subsidiary': paramsObj.subsidiary,
                'periodFrom': periodObj.periodTo.samePeriodLastFiscalYear.id,
                'periodTo': periodObj.periodTo.samePeriodLastFiscalYear.id
            });
        }

        nlapiLogExecution('AUDIT', 'doGet', 'rtn=' + JSON.stringify(rtn));
        return JSON.stringify(rtn);
    }

    /**
     * Validate passed-in parameters. Will throw exception if meets below condition:
     *      passed-in parameters is undefined, null or ''
     *      One-World account and subsidiary is undefined, null or ''
     *      One-World account with Multi-Calendar feature been enabled and fiscalCalendar is undefined, null or ''
     *      periodFrom is undefined, null or ''
     *      periodTo is undefined, null or ''
     * @return object of pass in parameters if there are no exception
     */
    function validateParams(params) {
        if (!params) {
            throw nlapiCreateError('RunStandardReportError', 'Run report params are undefined', true);
        }
        nlapiLogExecution('AUDIT', 'validateParams', 'params=' + JSON.stringify(params));

        if (!isObject(params)) {
            var paramsObj = JSON.parse(params);
        } else {
            paramsObj = params;
        }

        // subsidiary should not be undefined/null/'' for OW
        if (isOW && !paramsObj.subsidiary) {
            throw nlapiCreateError('RunStandardReportError', 'Subsidiary is mandatory for OW account', true);
        }

        if (isOW && isMultiCalendarEnabled() && !paramsObj.fiscalCalendar) {
            throw nlapiCreateError('RunStandardReportError', 'fiscalCalendar is mandatory for OW account with Multi-Calendar enabled', true);
        }

        // periodFrom should not be undefined/null/''
        if (!paramsObj.periodFrom) {
            throw nlapiCreateError('RunStandardReportError', 'period from is mandatory', true);
        }

        if (!paramsObj.periodTo) {
            throw nlapiCreateError('RunStandardReportError', 'period to is mandatory', true);
        }

        return paramsObj;
    }

    function runGeneralLedgerReport(paramsObj) {
        nlapiLogExecution('AUDIT', 'runGeneralLedgerReport', 'paramsObj=' + JSON.stringify(paramsObj));
        return runStandardReport(293, composeGeneralLedgerReportSettings(paramsObj), generalLedgerColumnName)
    }

    function runStandardReport(reportId, reportSettings, targetColumnName) {
        try {
            setupUserPref();
            var pivotTable = nlapiRunReport(reportId, reportSettings);
            if (!pivotTable) {
                return 0;
            }

            var colHier = pivotTable.getColumnHierarchy();
            var colChildren = colHier.getVisibleChildren();
            var targetCol = null;
            for ( var colIdx in colChildren) {
                nlapiLogExecution('DEBUG', 'runStandardReport', 'target col label: ' + colChildren[colIdx].getLabel());
                if (colChildren[colIdx].getLabel() === targetColumnName) {
                    targetCol = colChildren[colIdx];
                    break;
                }
            }

            if (targetCol === null) {
                throw nlapiCreateError('RunStandardReportError', 'Column ' + targetColumnName + ' does not exists', true);
            }

            recoverUserPref();

            var summaryRow = pivotTable.getRowHierarchy().getSummaryLine();
            return summaryRow !== null ? summaryRow.getValue(targetCol) : 0;
        } catch (ex) {
            nlapiLogExecution('ERROR', 'runStandardReport Error', ex);
            recoverUserPref();
            throw ex;
        }
    }

    function composeGeneralLedgerReportSettings(paramsObj) {
        var reportSettings = composeReportSettings(paramsObj);
        // Only show Bank types
        // Active Account by Type > Account Type
        reportSettings.addCriteria('aatype,account,saccttype,x,x', 'Bank');
        if (paramsObj.location) {
            reportSettings.addCriteria('regtx,tranline,klocation,x,alltranlineloc', paramsObj.location);
        }
        if (paramsObj.department) {
            reportSettings.addCriteria('regtx,tranline,kdepartment,x,alltranline29', paramsObj.department);
        }
        if (paramsObj.classification) {
            reportSettings.addCriteria('regtx,tranline,kclass,x,alltranline6', paramsObj.classification);
        }
        return reportSettings;
    }

    function runUnrealizedGainsAndLossesReport(paramsObj) {
        nlapiLogExecution('AUDIT', 'runUnrealizedGainsAndLossesReport', 'paramsObj=' + JSON.stringify(paramsObj));
        return runStandardReport(-133, composeUnrealizedGainsAndLossesReportSettings(paramsObj), unrealizedGainAndLossColumnName);
    }

    function composeUnrealizedGainsAndLossesReportSettings(paramsObj) {
        var reportSettings = composeReportSettings(paramsObj);
        // Only show Bank types
        // Account (Line) > Account Type
        reportSettings.addCriteria('urg,x,acct_saccttype,tranline,alltranline5', 'Bank');
        if (paramsObj.location) {
            reportSettings.addCriteria('urg,tranline,klocation,x,alltranlineloc', paramsObj.location);
        }
        if (paramsObj.department) {
            reportSettings.addCriteria('urg,x,dpt_sname,tranline,alltranline29', paramsObj.department);
        }
        if (paramsObj.classification) {
            reportSettings.addCriteria('urg,x,cls_sname,tranline,alltranline6', paramsObj.classification);
        }
        return reportSettings;
    }

    function composeReportSettings(paramsObj) {
        var settings = new nlobjReportSettings(paramsObj.periodFrom, paramsObj.periodTo);
        if (paramsObj.subsidiary) {
            settings.setSubsidiary(paramsObj.subsidiary);
        }
        return settings;
    }

    function setupUserPref() {
        var userPref = nlapiLoadConfiguration('userpreferences');
        this.reportByPeriod = userPref.getFieldValue('reportbyperiod');
        nlapiLogExecution('AUDIT', 'setupUserPref', 'reportByPeriod = ' + this.reportByPeriod);
        if (this.reportByPeriod !== 'FINANCIALS') {
            userPref.setFieldValue('reportbyperiod', 'FINANCIALS');
            nlapiSubmitConfiguration(userPref);
        }
    }

    function recoverUserPref() {
        if (this.reportByPeriod !== 'FINANCIALS') {
            var userPref = nlapiLoadConfiguration('userpreferences');
            userPref.setFieldValue('reportbyperiod', this.reportByPeriod);
            nlapiSubmitConfiguration(userPref);
        }
    }

    /**
     * Get accounting period information.
     * If periodFrom is 'Jan 2018', periodTo is 'Mar 2018', then return
     *      {
     *          'periodFrom': {
     *              'lastPeriod': {
     *                  'startdate': '12/1/2017',
     *                  'id': <internalid of 'Dec 2017' or undefined>,
     *                  'name': <'Dec 2017' or undefined>
     *              },
     *              'samePeriodLastFiscalYear': {
     *                  'startdate': '1/1/2017',
     *                  'id': <internalid of 'Jan 2017' or undefined>,
     *                  'name': <'Jan 2017' or undefined>
     *              },
     *              'lastPeriodOneFiscalYearAgo': {
     *                  'startdate': '12/1/2016',
     *                  'id': <internalid of 'Dec 2016' or undefined>,
     *                  'name': <'Dec 2016' or undefined>
     *              }
     *          },
     *          'periodTo': {
     *              'lastPeriod': {
     *                  'startdate': '2/1/2018',
     *                  'id': <internalid of 'Feb 2018' or undefined>,
     *                  'name': <'Feb 2018' or undefined>
     *              },
     *              'samePeriodLastFiscalYear': {
     *                  'startdate': '3/1/2017',
     *                  'id': <internalid of 'Mar 2017' or undefined>,
     *                  'name': <'Mar 2017' or undefined>
     *              },
     *              'lastPeriodOneFiscalYearAgo': {
     *                  'startdate': '2/1/2017',
     *                  'id': <internalid of 'Feb 2017' or undefined>,
     *                  'name': <'Feb 2017' or undefined>
     *              }  
     *          }
     *      }
     */
    function getPeriod(periodFrom, periodTo, fiscalCalendar) {
        var startDateInfo = getStartDateInfo(periodFrom, periodTo);
        var filterExpression = [
            [
                "isadjust",
                "is",
                "F"
            ],
            "AND",
            [
                "isinactive",
                "is",
                "F"
            ],
            "AND",
            [
                "isquarter",
                "is",
                "F"
            ],
            "AND",
            [
                "isyear",
                "is",
                "F"
            ],
            "AND",
            [
                [
                    "startdate",
                    "on",
                    startDateInfo.periodFromObj.lastPeriod
                ],
                "OR",
                [
                    "startdate",
                    "on",
                    startDateInfo.periodFromObj.samePeriodLastFiscalYear
                ],
                "OR",
                [
                    "startdate",
                    "on",
                    startDateInfo.periodFromObj.lastPeriodOneFiscalYearAgo
                ],
                "OR",
                [
                    "startdate",
                    "on",
                    startDateInfo.periodToObj.lastPeriod
                ],
                "OR",
                [
                    "startdate",
                    "on",
                    startDateInfo.periodToObj.samePeriodLastFiscalYear
                ],
                "OR",
                [
                    "startdate",
                    "on",
                    startDateInfo.periodToObj.lastPeriodOneFiscalYearAgo
                ]
            ]
        ];
        if (fiscalCalendar) {
            filterExpression.push('AND');
            filterExpression.push([
                "fiscalcalendar",
                "is",
                fiscalCalendar
            ]);
        }

        var periodNameCol = new nlobjSearchColumn('periodname');
        var startDateCol = new nlobjSearchColumn('startdate');
        var columns = [
            periodNameCol,
            startDateCol
        ];
        var searchresults = nlapiSearchRecord('accountingperiod', null, filterExpression, columns);
        nlapiLogExecution('DEBUG', 'getPeriod', 'searchresults = ' + JSON.stringify(searchresults));

        var rtn = {
            'periodFrom': {
                'lastPeriod': {
                    'startdate': startDateInfo.periodFromObj.lastPeriod
                },
                'samePeriodLastFiscalYear': {
                    'startdate': startDateInfo.periodFromObj.samePeriodLastFiscalYear
                },
                'lastPeriodOneFiscalYearAgo': {
                    'startdate': startDateInfo.periodFromObj.lastPeriodOneFiscalYearAgo
                }
            },
            'periodTo': {
                'lastPeriod': {
                    'startdate': startDateInfo.periodToObj.lastPeriod
                },
                'samePeriodLastFiscalYear': {
                    'startdate': startDateInfo.periodToObj.samePeriodLastFiscalYear
                },
                'lastPeriodOneFiscalYearAgo': {
                    'startdate': startDateInfo.periodToObj.lastPeriodOneFiscalYearAgo
                }
            }
        };

        for (var i = 0; searchresults != null && i < searchresults.length; i++) {
            var searchresult = searchresults[i];
            var id = searchresult.getId();
            var periodName = searchresult.getValue(periodNameCol);
            var startDate = searchresult.getValue(startDateCol);

            if (startDate === startDateInfo.periodFromObj.lastPeriod) {
                rtn.periodFrom.lastPeriod.id = id;
                rtn.periodFrom.lastPeriod.name = periodName
            } else if (startDate === startDateInfo.periodFromObj.samePeriodLastFiscalYear) {
                rtn.periodFrom.samePeriodLastFiscalYear.id = id;
                rtn.periodFrom.samePeriodLastFiscalYear.name = periodName;
            } else if (startDate === startDateInfo.periodFromObj.lastPeriodOneFiscalYearAgo) {
                rtn.periodFrom.lastPeriodOneFiscalYearAgo.id = id;
                rtn.periodFrom.lastPeriodOneFiscalYearAgo.name = periodName;
            }
            // periodFrom and periodTo might be the same
            if (startDate === startDateInfo.periodToObj.lastPeriod) {
                rtn.periodTo.lastPeriod.id = id;
                rtn.periodTo.lastPeriod.name = periodName;
            } else if (startDate === startDateInfo.periodToObj.samePeriodLastFiscalYear) {
                rtn.periodTo.samePeriodLastFiscalYear.id = id;
                rtn.periodTo.samePeriodLastFiscalYear.name = periodName;
            } else if (startDate === startDateInfo.periodToObj.lastPeriodOneFiscalYearAgo) {
                rtn.periodTo.lastPeriodOneFiscalYearAgo.id = id;
                rtn.periodTo.lastPeriodOneFiscalYearAgo.name = periodName;
            }
        }
        nlapiLogExecution('AUDIT', 'getPeriod', 'periodObj = ' + JSON.stringify(rtn));
        return rtn;
    }

    function getStartDateInfo(periodFrom, periodTo) {
        var filterExpression = [
            [
                "internalid",
                "anyof",
                periodFrom,
                periodTo
            ]
        ];

        var periodNameCol = new nlobjSearchColumn('periodname');
        var lastPeriodCol = new nlobjSearchColumn('formuladate').setFormula("ADD_MONTHS({startdate}, -1)");
        var samePeriodLastFiscalYearCol = new nlobjSearchColumn('formuladate').setFormula("ADD_MONTHS({startdate}, -12)");
        var lastPeriodOneFiscalYearAgoCol = new nlobjSearchColumn('formuladate').setFormula("ADD_MONTHS({startdate}, -13)");

        var columns = [
            periodNameCol,
            lastPeriodCol,
            samePeriodLastFiscalYearCol,
            lastPeriodOneFiscalYearAgoCol
        ];

        var searchresults = nlapiSearchRecord('accountingperiod', null, filterExpression, columns);

        for (var i = 0; searchresults != null && i < searchresults.length; i++) {
            var searchresult = searchresults[i];
            var id = searchresult.getId();

            if (id === periodFrom) {
                var fromPeriodObj = {
                    'id': periodFrom,
                    'name': searchresult.getValue(periodNameCol),
                    'lastPeriod': searchresult.getValue(lastPeriodCol),
                    'samePeriodLastFiscalYear': searchresult.getValue(samePeriodLastFiscalYearCol),
                    'lastPeriodOneFiscalYearAgo': searchresult.getValue(lastPeriodOneFiscalYearAgoCol)
                };
            }
            // Return two records even when from and to are the same
            if (id === periodTo) {
                var toPeriodObj = {
                    'id': periodFrom,
                    'name': searchresult.getValue(periodNameCol),
                    'lastPeriod': searchresult.getValue(lastPeriodCol),
                    'samePeriodLastFiscalYear': searchresult.getValue(samePeriodLastFiscalYearCol),
                    'lastPeriodOneFiscalYearAgo': searchresult.getValue(lastPeriodOneFiscalYearAgoCol)
                };
            }
        }
        nlapiLogExecution('DEBUG', 'getStartDateInfo', 'fromPeriodObj=' + JSON.stringify(fromPeriodObj));
        nlapiLogExecution('DEBUG', 'getStartDateInfo', 'toPeriodObj=' + JSON.stringify(toPeriodObj));
        return {
            'periodFromObj': fromPeriodObj,
            'periodToObj': toPeriodObj
        };
    }

    /**
     * Get earliest period that startdate is within startdateFrom and startdateTo.
     */
    function getEarliestPeriod(fiscalCalendar, startdateFrom, startdateTo) {
        nlapiLogExecution('DEBUG', 'getEarliestPeriod', 'fiscalCalendar=' + fiscalCalendar + ', startdateFrom=' + startdateFrom + ', startdateTo=' + startdateTo);
        var filters = getBasePeriodFilter(fiscalCalander);
        filters.push("AND").push([
            "startdate",
            "within",
            startdateFrom,
            startdateTo
        ]);
        nlapiLogExecution('DEBUG', 'getEarliestPeriod', 'filters=' + JSON.stringify(filters));

        var periodNameCol = new nlobjSearchColumn('periodname');
        var startDateCol = new nlobjSearchColumn('startdate');
        startDateCol.setSort(); // ascending order
        var columns = [
            periodNameCol,
            startDateCol
        ];
        var searchresults = nlapiSearchRecord('accountingperiod', null, filters, columns);
        if (!searchresults) {
            throw nlapiCreateError('RunStandardReportError', 'Should have at least one period between ' + startdateFrom + " and " + startdateTo, true);
        }
        nlapiLogExecution('DEBUG', 'getEarliestPeriod', 'return=' + searchresults[0].getValue(periodNameCol));
        return searchresults[0].id;
    }

    function getBasePeriodFilter(fiscalCalendar) {
        var baseFilter = [
            [
                "isadjust",
                "is",
                "F"
            ],
            "AND",
            [
                "isinactive",
                "is",
                "F"
            ],
            "AND",
            [
                "isquarter",
                "is",
                "F"
            ],
            "AND",
            [
                "isyear",
                "is",
                "F"
            ]
        ];
        if (fiscalCalander) {
            baseFilter.push("AND").push([
                "fiscalcalendar",
                "anyof",
                fiscalCalendar
            ]);
        }
        return baseFilter;
    }

    function getUserLanguage() {
        return nlapiLoadConfiguration('userpreferences').getFieldValue('language');
    }

    /**
     * @return true if it is One-World account.
     */
    function isOW() {
        return nlapiGetContext().getFeature('SUBSIDIARIES');
    }

    /**
     * @return true if Multi-Calendar feature has been enabled.
     */
    function isMultiCalendarEnabled() {
        return nlapiGetContext().getFeature('MULTIPLECALENDARS');
    }

    /**
     * @return true if Multi-Currency feature has been enabled.
     */
    function isMultiCurrencyEnabled() {
        return nlapiGetContext().getFeature('MULTICURRENCY');
    }

    function isObject(bechecked) {
        return typeof bechecked === 'object' && bechecked.constructor === Object || Object.prototype.toString.apply(bechecked) === '[object Object]';
    }
};

cn.rlv1.fin.standard.reports.run = function(params) {
    var standardReports = new cn.rlv1.fin.standard.reports();
    return standardReports.doGet(params);
}
