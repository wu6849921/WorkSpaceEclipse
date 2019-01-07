var Restlet = (function() {

    var columns = {};
    var glReportName = 'Sub Ledger & Cash/Bank Journal Reference';
    var reportByPeriod;
    var setReportByPeriod = false;

    function doGet(requestParams) {
        try{
        if (!requestParams) {
            nlapiLogExecution('ERROR', 'rl_cn_atbl_report.js: doGet', 'request params are undefined');
            throw nlapiCreateError('RunReportError', 'request params are undefined', true);
        }

        nlapiLogExecution('DEBUG', 'rl_cn_atbl_report.js: requestParams', requestParams);
        var pivotTable = runReport(requestParams);

        var reportData = handleReport(pivotTable);
        var reportDataId = cacheReportData(JSON.stringify(reportData));

        return JSON.stringify({
            reportDataId: reportDataId
        });
        }catch(ex){
            nlapiLogExecution('ERROR', 'rl_cn_run_atbl_report.js: doGet', 'errorInfo=' + ex.code + ':' + ex.details);
            return JSON.stringify({code: ex.code, details: ex.details});

        }
    }


    function runReport(requestParams) {
        setup();

        try {
            var pivotTable = nlapiRunReport(getReportId(), reportSettings(parameters(requestParams)));
        } catch (ex) {
            nlapiLogExecution('ERROR', 'rl_cn_atbl_report.js: runReport', JSON.stringify(ex));
            throw nlapiCreateError('RunReportError', ex.code +':'+ ex.message, true);
        }

        tearDown();

        return pivotTable;
    }

    function getReportId() {
        var searchResult = nlapiSearchGlobal('page:' + glReportName);
        if (!searchResult) {
            nlapiLogExecution('ERROR', 'rl_cn_atbl_report.js: getReportId', 'report cannot be found');
            throw nlapiCreateError('RunReportError', 'report cannot be found', true);
        }
        nlapiLogExecution('DEBUG', 'rl_cn_run_atbl_report.js: getReportId', 'Global search: searchResult is ' + JSON.stringify(searchResult));
        if (searchResult.length > 1) {
            nlapiLogExecution('ERROR', 'rl_cn_run_atbl_report.js: getReportId', 'There should be one and only one report(' + glReportName + ').');
            searchResult.sort(function(one, another) {
                if (one.id > another.id) {
                    return 1;
                } else if (one.id < another.id) {
                    return -1;
                } else {
                    return 0;
                }
            });
            nlapiLogExecution('ERROR', 'rl_cn_run_atbl_report.js: getReportId', 'Report ' + searchResult[0].id + ' will be in use.');
        }
        var id = Number(searchResult[0].id.replace(/REPO_/, ''));
        nlapiLogExecution('DEBUG', 'rl_cn_run_atbl_report.js: getReportId', 'ReportID=' + id);
        return id;
    }

    function handleReport(pivotTable) {
        handleColumns(pivotTable);

        var pivotRows = pivotTable.getRowHierarchy().getChildren();

        var treeResultRows = parseRows(pivotRows, 1, {});

        return treeResultRows;
    }


    function parameters(requestParams) {
        if (!isObject(requestParams)) {
            requestParams = JSON.parse(requestParams);
        }
        var filter = requestParams.filter;
        if (filter && !isObject(filter)) {
            filter = JSON.parse(filter);
        }
        return filter;
    }


    function cacheReportData(reportData) {
        var reportRecord = nlapiCreateRecord('customrecord_cn_atbl_report_data');
        reportRecord.setFieldValue('custrecord_cn_atbl_reportdata', nlapiEncrypt(reportData, 'base64'));

        return nlapiSubmitRecord(reportRecord);
    }

    function reportSettings(params) {
        var settings = new nlobjReportSettings(params.date.from.name, params.date.to.name);
        if (params.subsidiary) {
            if (params.subsidiary.id && isArray(JSON.parse(params.subsidiary.id))) {
                //for consolidated subsidiary
                settings.setSubsidiary(JSON.parse(params.subsidiary.id)[0]);
            } else {
                settings.setSubsidiary(params.subsidiary.id);
            }
        }
        if (params.location && params.location.id) {
            nlapiLogExecution('DEBUG', 'rl_cn_run_income_report.js: reportSettings', 'location filter string ' + params.location);
            settings.addCriteria('finan,tranline,klocation,x,alltranlineloc', params.location.id);
        }

        if (params.department && params.department.id) {
            nlapiLogExecution('DEBUG', 'rl_cn_run_income_report.js: reportSettings', 'department filter string ' + params.department);
            settings.addCriteria('finan,tranline,kdepartment,x,alltranline29', params.department.id);
        }

        if (params.clasz && params.clasz.id) {
            nlapiLogExecution('DEBUG', 'rl_cn_run_income_report.js: reportSettings', 'class filter string ' + params.clasz);
            settings.addCriteria('finan,tranline,kclass,x,alltranline6', params.clasz.id);
        }
        nlapiLogExecution('DEBUG', 'rl_cn_atbl_report.js: reportSettings', 'Report Settings: ' + JSON.stringify(params));
        return settings;
    }

    // Please note some of these fields may not be used as the report is shared by other features also.
    // This function is just providing a general fields parsing ability.
    function handleColumns(pivotTable) {
        var theColumns = pivotTable.getColumnHierarchy().getVisibleChildren();
        for (var i = 0; i < theColumns.length; i++) {
            var label = theColumns[i].getLabel();
            if (!label) {
                columns.amount = theColumns[i];
            } else if (label === 'Type') {
                columns.type = theColumns[i];
            } else if (label === 'Document Number') {
                columns.docnum = theColumns[i];
            } else if (label === 'GL#') {
                columns.glnum = theColumns[i];
            } else if (label === 'Date') {
                columns.date = theColumns[i];
            } else if (label === 'Memo') {
                columns.memo = theColumns[i];
            } else if (label === 'Payment Method') {
                columns.paymethod = theColumns[i];
            } else if (label === 'Transaction Number') {
                columns.trannum = theColumns[i];
            } else if (label === 'Transaction ID') {
                columns.internalid = theColumns[i];
            } else {
                columns.closing = theColumns[i];
            }
        }
    }

    function parseRows(rows, level, accumulator) {
        var result = [];

        if (!rows) {
            return result;
        }
        for (var i = 0; i < rows.length; i++) {
            var resultRows = parseRow(rows[i], level);
            if (!resultRows || !resultRows[0]) {
                continue;
            }
            accumulator.debit += resultRows[0].debit || 0;
            accumulator.credit += resultRows[0].credit || 0;
            //transaction level row will be accumulated but will NOT be inserted to result data
            if (isAccountRow(rows[i])) {
                result = result.concat(resultRows);
            }

        }
        return result;
    }

    function parseRow(row, level) {
        var result = [];
        if (!isValidRow(row)) {
            return result;
        }

        var childrenResults = parseChildrenRows(row, level);
        var resultRow = createResultRow(row, level, childrenResults);

        result.push(resultRow);
        return result;
    }

    function parseChildrenRows(row, level) {
        var accumulator = {
            debit: 0,
            credit: 0
        };
        return {
            children: parseRows(row.getChildren(), level + 1, accumulator),
            debit: accumulator.debit,
            credit: accumulator.credit
        }
    }

    function createResultRow(row, level, childrenResults) {
        if (isAccountRow(row)) {
            var closing = row.getSummaryLine() && row.getSummaryLine().getValue(columns.closing);
            return {
                account: row.getValue(),
                opening: closing - childrenResults.debit + childrenResults.credit,
                debit: childrenResults.debit,
                credit: childrenResults.credit,
                closing: closing,
                level: level,
                last: childrenResults.children.length < 1, //only account level row will be exist in childrenResults, so no child means last level account
                children: childrenResults.children
            }
        } else {
            var transactionAmount = Number(row.getValue(columns.amount));
            return {
                account: '',
                opening: 0,
                debit: transactionAmount >= 0 ? transactionAmount : 0,
                credit: transactionAmount < 0 ? -transactionAmount : 0,
                closing: 0
            }
        }
    }

    function isAccountRow(row) {
        return row.getValue(columns.type) === null;
    }

    function isValidRow(row) {
        return row && (row.getValue() || row.getValue(columns.amount));
    }

    function setup() {
        var userPref = nlapiLoadConfiguration('userpreferences');
        reportByPeriod = userPref.getFieldValue('reportbyperiod');
        if (reportByPeriod !== 'NEVER') {
            userPref.setFieldValue('reportbyperiod', 'NEVER');
            nlapiSubmitConfiguration(userPref);
            setReportByPeriod = true;
        }
    }

    function tearDown() {
        if (setReportByPeriod) {
            var userPref = nlapiLoadConfiguration('userpreferences');
            userPref.setFieldValue('reportbyperiod', reportByPeriod);
            nlapiSubmitConfiguration(userPref);
        }
    }
    function isObject(bechecked) {
        return typeof bechecked === 'object' && bechecked.constructor === Object || Object.prototype.toString.apply(bechecked) === '[object Object]';
    }

    function isArray(bechecked) {
        return bechecked && typeof bechecked === 'object' && bechecked.constructor === Array || Object.prototype.toString.apply(bechecked) === '[object Array]' || bechecked instanceof Array;
    }
    
    return {
        'get': doGet
    };

}());
