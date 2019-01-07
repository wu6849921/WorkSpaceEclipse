var Restlet = (function () {

    var rowData = [];

    function doGet(requestParams) {
        try {
        if (!requestParams) {
            nlapiLogExecution('ERROR', 'rl_cn_run_income_report.js: doGet', 'request params are undefined');
            throw nlapiCreateError('RunReportError', 'request params are undefined', true);
        }
        if (!isObject(requestParams)) {
            requestParams = JSON.parse(requestParams);
        }
        return runReport(requestParams);
        } catch (ex) {
            nlapiLogExecution('ERROR', 'rl_cn_run_income_report.js: runReport', 'errorInfo=' + ex.code + ':' + ex.details);
            return JSON.stringify({code: ex.code, details: ex.details});
        }
    }

    function runReport(requestParams) {
        setup();

        try {
            var pivotTable = nlapiRunReport(reportId(requestParams), reportSettings(parameters(requestParams)));
        } catch (ex) {
            nlapiLogExecution('ERROR', 'rl_cn_run_income_report.js: runReport', 'error occurred  ' + JSON.stringify(ex));
            throw nlapiCreateError('RunReportError', ex.message, true);
        }

        var reportData = handleReportResults(pivotTable);
        var reportDataId = cacheReportData(requestParams, reportData);

        tearDown();
        return JSON.stringify({
            reportDataId: reportDataId
        });
    }

    function handleReportResults(pivotTable) {
        var columns = pivotTable.getColumnHierarchy().getVisibleChildren();
        checkColumnsDefinedAsExpected(columns);

        var rows = pivotTable.getRowHierarchy().getChildren();
        handleRows(rows, columns);

        var results = {
            columnName0: columns[0].getLabel(),
            columnName1: columns[1].getLabel(),
            rows: rowData
        };
        nlapiLogExecution('DEBUG', 'rl_cn_run_income_report.js: handleReportResults', 'report result is ' + JSON.stringify(results));
        return JSON.stringify(results);
    }

    function handleRows(rows, columns) {
        for (var i = 0; i < rows.length; i++) {
            handleRow(rows[i], columns);
        }
    }

    function handleRow(row, columns) {
        if (!isValidRow(row) || isAccountRow(row)) {
            return;
        }

        var currentRow = {
            rowName: row.getValue(),
            value0: row.getValue(columns[0]),
            value1: row.getValue(columns[1])
        };
        rowData.push(currentRow);

        var childRows = row.getChildren() || [];
        if (!hasValidRows(childRows) || hasAccountRow(childRows)) {
            var summaryLine = row.getSummaryLine();
            currentRow.value0 = summaryLine.getValue(columns[0]);
            currentRow.value1 = summaryLine.getValue(columns[1]);
        }

        handleRows(childRows, columns);
    }

    function isValidRow(row) {
        return row && row.getValue();
    }

    function hasValidRows(rows) {
        if (!rows) {
            return false;
        }
        for (var i = 0; i < rows.length; i++) {
            if (isValidRow(rows[i])) {
                return true;
            }
        }
        return false;
    }

    function isAccountRow(row) {
        return isValidRow(row) && !row.getLabel();
    }

    function hasAccountRow(rows) {
        for (var i = 0; i < rows.length; i++) {
            if (isAccountRow(rows[i])) {
                return true;
            }
        }
    }

    function cacheReportData(requestParams, reportData) {
        var report = reportInfo(requestParams);

        var reportRecord = nlapiCreateRecord('customrecord_cn_income_report_data');
        reportRecord.setFieldValue('custrecord_cn_income_reportid', Number(report.id));
        reportRecord.setFieldValue('custrecord_cn_income_reportdata', nlapiEncrypt(reportData, 'base64'));
        reportRecord.setFieldValue('custrecord_cn_income_reportname', report.name);
        return nlapiSubmitRecord(reportRecord);
    }

    function checkColumnsDefinedAsExpected(columns) {
        if (!columns || columns.length !== 2) {
            nlapiLogExecution('ERROR', 'rl_cn_run_income_report.js: checkColumnsDefinedAsExpected', 'columns length should be two');
            throw nlapiCreateError('ReportColumnsUnExpected', 'columns length should be two', true);
        }
    }

    function parameters(requestParams) {
        var params = requestParams.params;
        if (params && !isObject(params)) {
            params = JSON.parse(params);
        }
        return params;
    }

    function reportSettings(params) {
        var settings = new nlobjReportSettings(params.period, params.period);
        if (params.subsidiary) {
            settings.setSubsidiary(params.subsidiary);
        }
        
        if (params.location && params.location !== '-1') {
            var locationFilterString = params.location;
            nlapiLogExecution('DEBUG', 'rl_cn_run_income_report.js: reportSettings', 'location filter string ' + locationFilterString);
            settings.addCriteria('finan,tranline,klocation,x,alltranlineloc', locationFilterString);
        }
        
        if (params.department && params.department !== '-1') {
            nlapiLogExecution('DEBUG', 'rl_cn_run_income_report.js: reportSettings', 'department filter string ' + params.department);
            settings.addCriteria('finan,tranline,kdepartment,x,alltranline29', params.department);
        }
        
        if (params.clasz && params.clasz !== '-1') {
            nlapiLogExecution('DEBUG', 'rl_cn_run_income_report.js: reportSettings', 'class filter string ' + params.clasz);
            settings.addCriteria('finan,tranline,kclass,x,alltranline6', params.clasz);
        }        
        
        nlapiLogExecution('DEBUG', 'rl_cn_run_income_report.js: reportSettings', 'Report Settings: ' + JSON.stringify(params));
        return settings;
    }

    function reportInfo(requestParams) {
        var report = requestParams.report;
        if (!report) {
            nlapiLogExecution('ERROR', 'rl_cn_run_income_report.js: reportInfo', 'report is undefined');
            throw nlapiCreateError('RunReportError', 'report is undefined', true);
        }
        if (!isObject(report)) {
            report = JSON.parse(report);
        }
        if (!report.id) {
            nlapiLogExecution('ERROR', 'rl_cn_run_income_report.js: reportInfo', 'report id is undefined');
            throw nlapiCreateError('RunReportError', 'report id is undefined', true);
        }
        return report;
    }

    function reportId(requestParams) {
        var id = reportInfo(requestParams).id;
        nlapiLogExecution('DEBUG', 'rl_cn_run_income_report.js: reportId', 'ReportID=' + id);
        return id;
    }

    function isObject(bechecked) {
        return typeof bechecked === 'object' && bechecked.constructor === Object || Object.prototype.toString.apply(bechecked) === '[object Object]';
    }

    var reportByPeriod;

    function setup() {
        var userPref = nlapiLoadConfiguration('userpreferences');
        reportByPeriod = userPref.getFieldValue('reportbyperiod');
        if (reportByPeriod === 'NEVER') {
            userPref.setFieldValue('reportbyperiod', 'FINANCIALS');
            nlapiSubmitConfiguration(userPref);
        }
    }

    function tearDown() {
        var userPref = nlapiLoadConfiguration('userpreferences');
        if (reportByPeriod === 'NEVER') {
            userPref.setFieldValue('reportbyperiod', reportByPeriod);
            nlapiSubmitConfiguration(userPref);
        }
    }

    return {
        'get': doGet
    };

}());
