/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    './cn_accounting_period_dao',
    './cn_subsidiary_dao',
    '../lib/wrapper/ns_wrapper_format',
    '../lib/wrapper/ns_wrapper_runtime',
    '../lib/commons'
],

function(accountPeriodDao, subsidiaryDao, formatter, runtime, commons) {

    var yearPeriods;
    var monthPeriods;

    function isCrossYear(oneDate, anotherDate) {
        var yearPeriods = getYearPeriods.apply(this);

        for (var i = 0; i < yearPeriods.length; i++) {
            var startDate = formatter.parseDate(yearPeriods[i].getValue('startdate'));
            var endDate = formatter.parseDate(yearPeriods[i].getValue('enddate'));

            if (inDateRange(startDate, endDate, oneDate) && inDateRange(startDate, endDate, anotherDate)) {
                return false;
            } else if (inDateRange(startDate, endDate, oneDate) && !inDateRange(startDate, endDate, anotherDate)) {
                return true;
            } else if (!inDateRange(startDate, endDate, oneDate) && inDateRange(startDate, endDate, anotherDate)) {
                return true;
            }
        }
        return false;
    }

    function isCrossMonth(oneDate, anotherDate) {
        var monthPeriods = getMonthPeriods.apply(this);

        for (var i = 0; i < monthPeriods.length; i++) {
            var startDate = formatter.parseDate(monthPeriods[i].getValue('startdate'));
            var endDate = formatter.parseDate(monthPeriods[i].getValue('enddate'));

            if (inDateRange(startDate, endDate, oneDate) && inDateRange(startDate, endDate, anotherDate)) {
                return false;
            } else if (inDateRange(startDate, endDate, oneDate) && !inDateRange(startDate, endDate, anotherDate)) {
                return true;
            } else if (!inDateRange(startDate, endDate, oneDate) && inDateRange(startDate, endDate, anotherDate)) {
                return true;
            }
        }
        return false;
    }

    function getYearPeriods() {
        if (!commons.makesure(yearPeriods)) {
            yearPeriods = accountPeriodDao.fetchPeriods({
                isYear: true,
                fiscalcalendar: getFiscalCalendar(this.subsidiary)
            });
        }
        return yearPeriods;
    }

    function getMonthPeriods() {
        if (!commons.makesure(monthPeriods)) {
            monthPeriods = accountPeriodDao.fetchPeriods({
                ismonth: true,
                fiscalcalendar: getFiscalCalendar(this.subsidiary)
            });
        }
        return monthPeriods;
    }

    function getFiscalCalendar(subsidiary) {
        if (!commons.makesure(subsidiary)) {
            return null;
        }
        return subsidiaryDao.getFiscalCalendar(subsidiary);
    }

    function inDateRange(startDate, endDate, theDate) {
        return theDate >= startDate && theDate <= endDate;
    }

    function data(subsidiary) {
        return {
            subsidiary: subsidiary,
            isCrossYear: isCrossYear,
            isCrossMonth: isCrossMonth
        };
    }
    return {
        data: data
    };

});
