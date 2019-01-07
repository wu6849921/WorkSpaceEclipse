/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    '../lib/wrapper/ns_wrapper_search',
    '../lib/commons',
    './helper/search_helper',
    '../lib/wrapper/ns_wrapper_format',
    '../lib/wrapper/ns_wrapper_record',
    '../lib/wrapper/ns_wrapper_runtime',
    './cn_subsidiary_dao',
    '../../lib/date-zh-CN'
],

function (search, commons, helper, formatter, record, runtime, subsidiaryDao, date) {

    function fetchAccountsAsDropDown(params) {
        var accounts = fetchAccounts(params);
        return reviseAccounts(accounts);
    }

    function reviseAccounts(accounts) {
        var options = [{value: ' ', text: '&nbsp;'}];
        for (var i = 0; accounts && i < accounts.length; i++) {
            options.push({
                value: accounts[i].id,
                text: formAccountName(accounts[i].getValue('name'), accounts[i].getValue('number'))
            });
        }
        log.debug('cn_extended_report_dao:reviseAccounts ', 'options count before dedup: ' + JSON.stringify(options.length));
        options = commons.dedup(options, function(mapEntry) {
            return mapEntry.value;
        });
        log.debug('cn_extended_report_dao:reviseAccounts', 'options count after dedup: ' + JSON.stringify(options.length));
        return options;
    }

    function formAccountName(name, number) {
        if (!commons.makesure(number)) {
            return name;
        }
        var numberIndex = name.indexOf(number);
        if (numberIndex === -1) {
            return name;
        }
        return number + ' - ' + name.slice(numberIndex + number.length + 1);
    }

    function fetchAccounts(params) {
        return queryAccounts(params);
    }

    function queryAccounts(params) {
        if(!commons.makesure(params)) {
            params = {};
        }

        var columns = [
            helper.column('name').asc().create()
        ];
        if (!commons.ensure(params.isAccountNumberDisabled)) {
            columns.push(helper.column('number').create());
        }
        columns.push(helper.column('type').create());

        var filters = [];
        if (commons.ensure(params.subsidiary)) {
            filters.push(helper.filter('subsidiary').is(JSON.parse(params.subsidiary)));
        }
        if (commons.ensure(params.type)) {
            filters.push(helper.filter('type').is(params.type));
        }

        try {
            return helper.resultset(search.create({
                type: search.Type.ACCOUNT,
                filters: filters,
                columns: columns
            }).run());
        } catch (ex) {
            if (ex.name === 'SSS_INVALID_SRCH_COL') {
                params.isAccountNumberDisabled = true;
                return queryAccounts(params);
            }
            throw ex;
        }
    }

    function cleanupReportData(type) {
        var twoDaysAgo = formatter.formatDate((2).days().ago());
        log.debug('cn_extended_report_dao.js: cleanupReportData', 'Cleanup report data of ' + twoDaysAgo + ' from ' + type);

        var reportData = helper.resultset(search.create({
            type: type,
            filters: helper.filter('created').onorbefore(twoDaysAgo),
            columns: helper.column('internalid').create()
        }).run());

        var deleteCount = 0;
        for (var i = 0; i < reportData.length; i++) {
            var internalId = reportData[i].getValue('internalid');
            try {
                record.remove({
                    type: type,
                    id: internalId
                });
                deleteCount++;
            } catch (ex) {
                log.error('cn_extended_report_dao.js: cleanupReportData', 'Cannot delete report data ' + internalId);
                log.error('cn_extended_report_dao.js: cleanupReportData', ex.message);
            }
        }
        log.debug('cn_extended_report_dao.js: cleanupReportData', 'Done. Total ' + deleteCount + ' report data deleted from ' + type);
    }

    function queryMonthlyPeriodForGLReport(periodFrom, periodTo, subsidiary) {
        var period = record.load({
            type: record.Type.ACCOUNTING_PERIOD,
            id: periodFrom
        });
        var startDate = formatter.formatDate(period.getValue('startdate'));
        period = record.load({
            type: record.Type.ACCOUNTING_PERIOD,
            id: periodTo
        });
        var endDate = formatter.formatDate(period.getValue('enddate'));
        return helper.resultset(search.create({
            type: search.Type.ACCOUNTING_PERIOD,
            filters: periodFilter({
                startdate: startDate,
                enddate: endDate,
                subsidiary: subsidiary
            }),
            columns: periodColumns()
        }).run());
    }

    function queryMonthlyPeriodForDate(startdate, enddate, subsidiary) {
        var startPeriod = helper.resultset(search.create({
            type: search.Type.ACCOUNTING_PERIOD,
            filters: dateFilter({
                date: startdate,
                subsidiary: subsidiary
            }),
            columns: periodColumns()
        }).run());

        var endPeriod = helper.resultset(search.create({
            type: search.Type.ACCOUNTING_PERIOD,
            filters: dateFilter({
                date: enddate,
                subsidiary: subsidiary
            }),
            columns: periodColumns()
        }).run());
        var res = [];
        var tmpstart;
        var tmpend;
        if (commons.makesure(startPeriod)) { // consider the outboundary of the index
            tmpstart = startPeriod[0].getValue('startdate');
        }
        else {
            tmpstart = startdate;
        }
        
        if (commons.makesure(endPeriod)) {
            tmpend = endPeriod[0].getValue('enddate');
        } else {
            tmpend = enddate;
        }

        if (timeSpanCoverMultiPeriods(startPeriod, endPeriod)) {

            var resset = helper.resultset(search.create({
                type: search.Type.ACCOUNTING_PERIOD,
                filters: periodFilter({
                    startdate: tmpstart,
                    enddate: tmpend,
                    subsidiary: subsidiary
                }),
                columns: periodColumns()
            }).run());
            for (var i = 0; commons.makesure(resset) && i < resset.length; i++) {
                res.push({
                    startdate: resset[i].getValue('startdate'),
                    enddate: resset[i].getValue('enddate')
                })
            }
        }
        else {
            res.push({
                startdate: startPeriod[0].getValue('startdate'),
                enddate: startPeriod[0].getValue('enddate')
            }); // the start and the end are in the same period
        }
        if (commons.makesure(res)) {
            if(commons.makesure(startPeriod)){
                res[0].startdate = startdate;
            }
            if(commons.makesure(endPeriod)){
                res[res.length - 1].enddate = enddate;
            }

            
        }
        return res;
    }

    function timeSpanCoverMultiPeriods(startPeriod, endPeriod){
        return !commons.makesure(startPeriod) || !commons.makesure(endPeriod) || Date.parse(startPeriod[0].getValue('startdate')) < Date.parse(endPeriod[0].getValue('startdate'));
    }

    function dateFilter(params) {
        var filters = [
            helper.filter('isadjust').is('F'),
            helper.filter('isquarter').is('F'),
            helper.filter('startdate').onorbefore(params.date),
            helper.filter('enddate').onorafter(params.date)];

        filters.push(helper.filter('isyear').is('F'));

        if (commons.ensure(params.subsidiary.id) && runtime.isMultipleCalendars()) {
            var fiscalCalendar = subsidiaryDao.getFiscalCalendar(params.subsidiary.id);
            filters.push(helper.filter('fiscalcalendar').is(fiscalCalendar));
        }
        log.debug('cn_extended_report_dao.js: filters start', filters);
        return filters;
    }

    

    function periodFilter(params) {
        var filters = [
            helper.filter('isadjust').is('F'),
            helper.filter('isquarter').is('F'),
            helper.filter('startdate').onorafter(params.startdate),
            helper.filter('enddate').onorbefore(params.enddate)
        ];
        if (commons.ensure(params.isYear)) {
            filters.push(helper.filter('isyear').is('T'));
        } else {
            filters.push(helper.filter('isyear').is('F'));
        }
        if (commons.ensure(params.subsidiary.id) && runtime.isMultipleCalendars()) {
            var fiscalCalendar = subsidiaryDao.getFiscalCalendar(params.subsidiary.id);
            filters.push(helper.filter('fiscalcalendar').is(fiscalCalendar));
        }
        return filters;
    }

    function periodColumns() {
        return [
            helper.column('periodname').create(),
            helper.column('startdate').sort(search.Sort.ASC).create(),
            helper.column('enddate').create()
        ];
    }

    function getPrintBy() {
        try {
            var user = record.load({
                type: record.Type.EMPLOYEE,
                id: runtime.getCurrentUser().id
            });
        } catch (ex) {
            log.debug("app_cn_atbl_report_handler:getPrintBy", "error when loading current employee: " + JSON.stringify(ex));
            return runtime.getCurrentUser().name;
        }
        var first = user.getValue('firstname') || '', last = user.getValue('lastname') || '',
        middle = user.getValue('middlename') || '';
        var fullEN = first + (middle ? ' ' + middle : '') + (last ? ' ' + last : '');
        var fullCN = last + middle + first;
        var isAllCJK = commons.isCJKUnifiedIdeographs(last.trim() + middle.trim() + first.trim());
        return isAllCJK ? fullCN : fullEN;
    }

    function getGlReportDataByIds(reportDataIds) {
        if (!commons.makesure(reportDataIds) || !commons.isArray(reportDataIds)) {
            return [];
        }
        return helper.resultset(search.create({
            type: "customrecord_cn_gl_report_data",
            filters: [
                helper.filter('internalid').anyof(reportDataIds),
            ],
            columns: [
                helper.column('internalid').sort(search.Sort.ASC).create(),
                helper.column('custrecord_cn_gl_reportdata').create()
            ]
        }).run());
    }


    return {
        fetchAccountsAsDropDown: fetchAccountsAsDropDown,
        fetchAccounts: fetchAccounts,
        queryMonthlyPeriodForGLReport: queryMonthlyPeriodForGLReport,
        cleanupReportData: cleanupReportData,
        getPrintBy: getPrintBy,
        getGlReportDataByIds: getGlReportDataByIds,
        queryMonthlyPeriodForDate: queryMonthlyPeriodForDate
    };

});
