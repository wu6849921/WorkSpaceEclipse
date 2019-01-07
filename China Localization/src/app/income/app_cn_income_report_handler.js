/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */

define([
    '../../lib/wrapper/ns_wrapper_url',
    '../../lib/wrapper/ns_wrapper_https',
    '../../lib/wrapper/ns_wrapper_format',
    '../../lib/wrapper/ns_wrapper_config',
    '../../lib/wrapper/ns_wrapper_record',
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../res/income/incomeresource',
    '../../lib/commons',
    '../../lib/wrapper/ns_wrapper_encode',
    '../../dao/cn_accounting_period_dao',
    '../../dao/cn_subsidiary_dao',
    '../../lib/letsdoauth'
],

function(url, https, formatter, config, record, runtime, resource, commons, encode, periodDao, subsidiaryDao, letsdoauth) {
    var labels = resource.load(resource.Name.Labels);

    function getReportData(filter, reportDataId) {
        var reportDataObj = getCachedReportData(reportDataId);
        log.debug('app_cn_income_report_handler.js: getReportData', 'Report data is ' + JSON.stringify(reportDataObj));

        var rows = reportDataObj.rows;
        for (var i = 0; i < rows.length; i++) {
            rows[i].value0 = formatReportCurrency(changeUnit(rows[i].value0, filter.unit.id));
            rows[i].value1 = formatReportCurrency(changeUnit(rows[i].value1, filter.unit.id));
        }

        var body = {
            columnItemsName: labels.Items,
            columnLinesName: labels.Lines,
            columnName0: formatReportColumnName(reportDataObj.columnName0, filter.subsidiary),
            columnName1: formatReportColumnName(reportDataObj.columnName1, filter.subsidiary),
            rows: rows
        };
        return {
            title: labels.ReportTitle,
            category: labels.Category,
            preparedby: {
                name: labels.PreparedBy + labels.Colon,
                value: getPreparedBy(filter.subsidiary)
            },
            period: {
                name: labels.Period,
                value: filter.period.name.trim()
            },
            unit: {
                name: labels.Unit  + labels.Colon,
                value: getUnit(filter.subsidiary, filter.unit)
            },
            location: {
                name: labels.Location  + labels.Colon,
                value: filter.location.name.trim()
            },
            department: {
                name: labels.Department  + labels.Colon,
                value: filter.department.name.trim()
            },
            clasz: {
                name: labels.Clasz  + labels.Colon,
                value: filter.clasz.name.trim()
            },
            body: body
        };
    }

    function getCachedReportData(reportDataId) {
        var reportData = record.load({
            type: 'customrecord_cn_income_report_data',
            id: reportDataId
        });
        return JSON.parse(encode.convert({
            string: reportData.getValue('custrecord_cn_income_reportdata'),
            inputEncoding: encode.Encoding.BASE_64,
            outputEncoding: encode.Encoding.UTF_8
        }));
    }

    function auth(authInfo, hashFunction) {
        var that = this;

        function getReportData(filter) {
            var rlURL = url.resolveScript({
                scriptId: 'customscript_rl_cn_run_income_report',
                deploymentId: 'customdeploy_rl_cn_run_income_report',
                returnExternalUrl: true,
                params: {
                    report: JSON.stringify({
                        id: filter.report.id
                    }),
                    params: JSON.stringify({
                        period: filter.period.id,
                        subsidiary: commons.ensure(filter.subsidiary) ? filter.subsidiary.id : null
                    })
                }
            });
            authInfo.url = rlURL;
            authInfo.method = 'GET';
            log.debug('app_cn_income_report_handler.js: Authorization', 'authInfo=' + JSON.stringify(authInfo) + ' hashFunction=' + hashFunction);

            var response = https.get({
                url: rlURL,
                headers: {
                    'Authorization': authInfo.isoauth ? letsdoauth.oAuth(authInfo, hashFunction) : letsdoauth.basicAuth(authInfo)
                }
            });
            log.debug('app_cn_income_report_handler.js: auth.getReportData', 'response ' + response.body);

            var responseObj = JSON.parse(response.body);
            return that.getReportData(filter, responseObj.reportDataId);
        }

        return {
            getReportData: getReportData
        };
    }

    function getPreparedBy(subsidiary) {
        if (commons.ensure(subsidiary.id)) {
            return subsidiary.name.trim();
        }
        return config.getCompanyName();
    }

    function formatReportCurrency(currency) {
        return commons.makesure(currency) ? formatter.formatCurrency(currency) : '';
    }

    function changeUnit(currency, unit) {
        return commons.makesure(currency) ? currency / unit : '';
    }

    function formatReportColumnName(columnName, subsidiary) {
        var periodStartAt = columnName.lastIndexOf('(');
        var periodEndAt = columnName.lastIndexOf(')');

        if (periodStartAt !== -1 && periodEndAt !== -1) {
            var assumedPeriodName = columnName.substring(periodStartAt + 1, periodEndAt);
            var periods = getPeriods(subsidiary);
            for (var i = 0; i < periods.length; i++) {
                var periodName = periods[i].getValue('periodname');
                if (assumedPeriodName.indexOf(periodName) !== -1) {
                    return columnName.substring(0, periodStartAt).trim();
                }
            }
        }
        return columnName;
    }

    function getPeriods(subsidiary) {
        if (runtime.isMultipleCalendars()) {
            return periodDao.fetchPeriods({
                fiscalcalendar: subsidiaryDao.getFiscalCalendar(commons.ensure(subsidiary) ? subsidiary.id : null)
            });
        } else {
            return periodDao.fetchAllPeriods();
        }
    }

    function getUnit(subsidiary, unit) {
        return config.getCurrency({
            subsidiaryId: commons.ensure(subsidiary) ? subsidiary.id : null
        }).code + '/' + unit.name;
    }

    return {
        auth: auth,
        getReportData: getReportData
    };

});
