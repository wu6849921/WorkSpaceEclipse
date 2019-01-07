var Restlet = (function() {

    var theRequestParams, columns = {}, dataModel = [], reportData = [];
    var resultRowsCounter = 0;
    var accountLevel = {tofirst: 'tofirst', tolast: 'tolast', onlylast: 'onlylast'};
    var glReportName = 'Sub Ledger & Cash/Bank Journal Reference';
    var reportByPeriod;
    var setReportByPeriod = false;

    function doGet(requestParams) {
        try {
        if (!requestParams) {
            nlapiLogExecution('ERROR', 'rl_cn_run_gl_report.js: doGet', 'request params are undefined');
            throw nlapiCreateError('RunReportError', 'request params are undefined', true);
        }
        nlapiLogExecution('DEBUG', 'rl_cn_run_gl_report.js: doGet', requestParams);
        theRequestParams = !isObject(requestParams) ? JSON.parse(requestParams) : requestParams;

        var pivotTable = runReport();
        buildReportDataModel(pivotTable);
        generateReportData();
        nlapiLogExecution('DEBUG', 'rl_cn_run_gl_report.js: doGet', 'reportData=' + JSON.stringify(reportData));
        var reportDataId = cacheReportData(JSON.stringify(reportData));
        checkRowsExceedThreshold(reportDataId);
        return JSON.stringify({
            reportDataId: reportDataId
        });
        } catch(ex){
            //fix bug for Issue#506886 Unexpected behavior of Restlet 1.0 API
            nlapiLogExecution('ERROR', 'rl_cn_run_gl_report.js: doGet', 'errorInfo=' + ex.code + ':' + ex.details);
            return JSON.stringify({code: ex.code, details: ex.details});
        }
    }

     function runReport() {
        setup();
        try {
            var reportId = getReportId();
            var reportSetting = reportSettings(parameters());
            var  pivotTable = nlapiRunReport(reportId, reportSetting);
        } catch (ex) {
            nlapiLogExecution('ERROR', 'rl_cn_run_gl_report.js: runReport','ex:' + JSON.stringify(ex));
            if(ex.code === 'UNEXPECTED_ERROR') {
                try {
                    nlapiLogExecution('AUDIT', 'rl_cn_run_gl_report.js: runReport', 'rerun report with same settings as unexpected error occurred');
                    pivotTable = nlapiRunReport(reportId, reportSetting);
                } catch (e) {
                    nlapiLogExecution('AUDIT', 'rl_cn_run_gl_report.js: runReport', 'error occurred while rerunning report');
                    throw nlapiCreateError('RunReportError', e.code +':'+ e.message, true);
                }
            }
            else{
                throw nlapiCreateError('RunReportError', ex.code +':'+ ex.message, true);
            }
        }
        tearDown();
        return pivotTable;
    }

    function buildReportDataModel(pivotTable) {
        handleColumns(pivotTable);
        var pivotRows = pivotTable.getRowHierarchy().getChildren();
        handleRows(pivotRows);
    }

    function generateReportData() {
        var level = theRequestParams.filter.accountlevel;
        if (level === accountLevel.onlylast) {
            for (var i = 0; i < dataModel.length; i++) {
                generateOnlyLastReportData(dataModel[i]);
            }
        }
    }

    function inAccountRange(account) {
        var accountFromTo = theRequestParams.filter.account;
        return !accountFromTo || (!accountFromTo.from && !accountFromTo.to) ||
            (!accountFromTo.from.name && !accountFromTo.to.name) ||
            (accountFromTo.from.name && !accountFromTo.to.name && account >= accountFromTo.from.name) ||
            (!accountFromTo.from.name && accountFromTo.to.name && account <= accountFromTo.to.name) ||
            (accountFromTo.from.name && accountFromTo.to.name && account >= accountFromTo.from.name && account <= accountFromTo.to.name);
    }

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
                columns.balance = theColumns[i];
            }
        }
    }

    function handleRows(rows, parentEntry) {
        for (var i = 0; i < rows.length; i++) {
            handleRow(rows[i], parentEntry);
        }
    }

    function handleRow(row, parentEntry) {
        if (!isValidRow(row)) {
            return;
        }
        if (isTranRow(row)) {
            if (parentEntry && isValidTranRow(row)) {
                parentEntry.children.push(formTranEntry(row));
            }
            return;
        }

        var account = row.getValue();
        var childRows = row.getChildren();

        if (!inAccountRange(account) && !parentEntry) {
            handleRows(childRows);
        } else if (isValidAccountRow(row)) {
            var accountEntry = formAccountEntry(row);
            if (!parentEntry) {
                dataModel.push(accountEntry);
            } else {
                parentEntry.children.push(accountEntry);
            }
            for (var j = 0; j < childRows.length; j++) {
                if (isValidTranRow(childRows[j])) {
                    accountEntry.children.push(formTranEntry(childRows[j]));
                } else if (isValidAccountRow(childRows[j])) {
                    var childAccountEntry = formAccountEntry(childRows[j]);
                    accountEntry.children.push(childAccountEntry);
                    handleRows(childRows[j].getChildren(), childAccountEntry);
                }
            }
        }
    }

    function formAccountEntry(row) {
        var summaryLine = row.getSummaryLine();
        var openingLine = row.getOpeningLine();
        return {
            account: row.getValue(),
            opening: openingLine.getValue(columns.balance),
            closing: summaryLine.getValue(columns.balance),
            credit: summaryLine.getValue(columns.amount),
            children: []
        }
    }

    function formTranEntry(row) {
        var amount = row.getValue(columns.amount);
        return {
            type: row.getValue(columns.type),
            docnum: row.getValue(columns.docnum),
            internalid: row.getValue(columns.internalid),
            trannum: row.getValue(columns.trannum),
            glnum: columns.glnum && row.getValue(columns.glnum)? row.getValue(columns.glnum): undefined,
            date: row.getValue(columns.date) ? String(row.getValue(columns.date)) : undefined,
            memo: row.getValue(columns.memo)? row.getValue(columns.memo) : undefined,
            paymethod: row.getValue(columns.paymethod)? row.getValue(columns.paymethod) : undefined,
            debit: amount > 0 ? amount : 0,
            credit: amount < 0 ? amount : 0,
            balance: row.getValue(columns.balance)
        };
    }

    function isValidRow(row) {
        return row && (row.getValue() || row.getValue(columns.amount));
    }

    function isValidTranRow(row) {
        return isTranRow(row) && row.getValue(columns.amount) !== 0;
    }

    function isTranRow(row) {
        return isValidRow(row) && row.getValue(columns.type);
    }

    function isAccountRow(row) {
        return isValidRow(row) && !row.getValue(columns.type);
    }

    function isValidAccountRow(row) {
        if (!isAccountRow(row)) {
            return false;
        }
        var openingLine = row.getOpeningLine();
        var opening = openingLine.getValue(columns.balance);
        if (opening) {
            return true;
        }
        var summaryLine = row.getSummaryLine();
        var closing = summaryLine.getValue(columns.balance);
        if (closing) {
            return true;
        }
        var childRows = row.getChildren();
        if (!childRows) {
            return false;
        }
        for (var i = 0; i < childRows.length; i++) {
            if (isValidRow(childRows[i])) {
                return true;
            }
        }
        return false;
    }

    var bankAccounts;
    function generateOnlyLastReportData(dataEntry, isChildOfAccountTo) {
        if (!isValidAccount(dataEntry)) {
            return;
        }
        var children = dataEntry.children;
        var tranCount = 0;
        isChildOfAccountTo = isChildOfAccountTo ? isChildOfAccountTo : isAccountTo(dataEntry.account);
        for (var i = 0; i < children.length; i++) {
            if (children[i].type) { // current child is transaction
                tranCount ++;
            } else { // current child is account
                generateOnlyLastReportData(children[i], isChildOfAccountTo);
            }
        }
        var isAccountToPickup = shouldPickupAccountEntry({
            isLastLevelAccount: tranCount === children.length, // last level account
            dataEntry: dataEntry,
            isChildOfAccountTo: isChildOfAccountTo
        });

        if (isAccountToPickup) {
                resultRowsCounter = resultRowsCounter + tranCount + 1;
                reportData.push(dataEntry);

        }
    }

    function shouldPickupAccountEntry(params) {
        if (!params.isLastLevelAccount) {
            return false;
        }
        if (!inAccountRange(params.dataEntry.account) && !params.isChildOfAccountTo) {
            return false;
        }
        
        if (theRequestParams.type && theRequestParams.type === 'cbjl') {
            if (!bankAccounts) {
                bankAccounts = queryBankAccounts();
            }
            if (bankAccounts.indexOf(params.dataEntry.account) === -1) { // check current dataEntry is bank account
                
                return false;
            }
        }
        return true;
    }

    function isValidAccount(accountEntry) {
        if (!isObject(accountEntry)) {
            return false;
        }
        return accountEntry.opening !== 0 || accountEntry.closing !== 0 || accountEntry.children.length > 0;
    }

    function isAccountTo(account) {
        if (!theRequestParams.filter.account || !theRequestParams.filter.account.to) {
            return true;
        }
        if (account === theRequestParams.filter.account.to.name) {
            return true;
        }
        return false;
    }

    function parameters() {
        var filter = theRequestParams.filter;
        if (filter && !isObject(filter)) {
            filter = JSON.parse(filter);
        }
        theRequestParams.filter = reviseFilter(filter);
        return filter;
    }

    function queryBankAccounts(isAccountNumberDisabled) {
        var columns = [new nlobjSearchColumn('name', null, null)];
        if (!isAccountNumberDisabled) {
            columns.push(new nlobjSearchColumn('number', null, null));
        }
        var filters = [new nlobjSearchFilter('type', null, 'is', 'Bank')];
        if (theRequestParams.filter.subsidiary && theRequestParams.filter.subsidiary.id) {
            filters.push(new nlobjSearchFilter('subsidiary', null, 'is', theRequestParams.filter.subsidiary.id));
        }
        var returnResults = [];
        try {
            var search = nlapiCreateSearch('account', filters, columns);
            var results = search.runSearch();
            
            var resultColumns = results.getColumns();
            
            results.forEachResult(function (element) {
                var result = {};
                
                for (var i = 0; i < resultColumns.length; i++) {
                    var columnName = resultColumns[i].getName();
                    result[columnName.toLowerCase()] = element.getValue(columnName);
                    
                }
                returnResults.push(reviseAccountName(result));
                return true;
            });
            
        } catch (ex) {
            if (ex.name === 'SSS_INVALID_SRCH_COL') {
                nlapiLogExecution('AUDIT', 'rl_cn_run_gl_report.js: queryBankAccounts', 'invalid search columns and rerun to stop error ' + ex);
                return queryBankAccounts(true);
            }
            nlapiLogExecution('ERROR', 'rl_cn_run_gl_report.js: queryBankAccounts', 'big catch=' + ex);
        }
        return returnResults;
    }

    function reviseFilter(filter) {
        if (filter.account && filter.account.from.id) {
            var nameNumber = nlapiLookupField('account', filter.account.from.id, ['name', 'number']);
            filter.account.from.name = reviseAccountName(nameNumber);
        }
        if (filter.account && filter.account.to.id) {
            nameNumber = nlapiLookupField('account', filter.account.to.id, ['name', 'number']);
            filter.account.to.name = reviseAccountName(nameNumber);
        }
        return filter;
    }

    // we need account name no hierarchy to match standard report account name
    function reviseAccountName(nameNumber) {
        var name = nameNumber.name;
        var number = nameNumber.number;
        if (!number) {
            return accountNameNoHierarchy(name);
        }
        var numberIndex = name.indexOf(number);
        if (numberIndex === -1) {
            return accountNameNoHierarchy(name);
        }
        name = accountNameNoHierarchy(name.slice(numberIndex + number.length + 1));
        return number + ' - ' + name;
    }

    function accountNameNoHierarchy(name) {
        var lastIndex = name.lastIndexOf(':');
        return lastIndex >= 0 ? name.slice(lastIndex + 1).trim() : name;
    }

    function getReportId() {
        var searchResult = nlapiSearchGlobal('page:' + glReportName);
        if (!searchResult) {
            nlapiLogExecution('ERROR', 'rl_cn_run_gl_report.js: getReportId', 'report cannot be found');
            throw nlapiCreateError('RunReportError', 'report cannot be found', true);
        }
        nlapiLogExecution('DEBUG', 'rl_cn_run_gl_report.js: getReportId', 'Global search: searchResult is ' + JSON.stringify(searchResult));
        if (searchResult.length > 1) {
            nlapiLogExecution('ERROR', 'rl_cn_run_gl_report.js: getReportId', 'There should be one and only one report(' + glReportName + ').');
            searchResult.sort(function(one, another) {
                if (one.id > another.id) {
                    return 1;
                } else if (one.id < another.id) {
                    return -1;
                } else {
                    return 0;
                }
            });
            nlapiLogExecution('ERROR', 'rl_cn_run_gl_report.js: getReportId', 'more than one report returned, report with id as ' + searchResult[0].id + ' will be used');
        }
        var id = Number(searchResult[0].id.replace(/REPO_/, ''));
        nlapiLogExecution('DEBUG', 'rl_cn_run_gl_report.js: getReportId', 'ReportID=' + id);
        return id;
    }

    function cacheReportData(reportData) {
        var reportDataIds = [];
        chunkString(nlapiEncrypt(reportData, 'base64')).forEach(function(element) {
            var reportRecord = nlapiCreateRecord('customrecord_cn_gl_report_data');
            reportRecord.setFieldValue('custrecord_cn_gl_reportdata', element);
            reportDataIds.push(nlapiSubmitRecord(reportRecord));
        });
        nlapiLogExecution('DEBUG', 'rl_cn_run_gl_report.js: cacheReportData', 'cached reportDataIds ' + JSON.stringify(reportDataIds));
        return reportDataIds;
    }

    function chunkString(str) {
        var ret = [], len = 1000000;
        for (var offset = 0; offset < str.length; offset += len) {
            ret.push(str.slice(offset, offset + len));
        }
        return ret;
    }

    function checkRowsExceedThreshold(reportDataId) {
        nlapiLogExecution('DEBUG', 'rl_cn_run_gl_report.js:checkRowsExceedThreshold', 'resultRowsCounter: ' + resultRowsCounter);
        if (resultRowsCounter > 5000) {
            throw nlapiCreateError('ReportRowsExceedThreshold', 'ReportDataId:' + JSON.stringify(reportDataId), true);
        }
    }

    function reportSettings(params) {
        var settings = new nlobjReportSettings(params.date.from.name, params.date.to.name);

        if (params.subsidiary && params.subsidiary.id) {
            if (params.subsidiary.id && isArray(JSON.parse(params.subsidiary.id))) {
                //for consolidated subsidiary
                settings.setSubsidiary(JSON.parse(params.subsidiary.id)[0]);
            } else {
                settings.setSubsidiary(params.subsidiary.id);
            }
        }

        if (params.location && params.location.id) {
            var locationFilterString = params.location.id;
            nlapiLogExecution('DEBUG', 'rl_cn_run_gl_report.js: reportSettings', 'location filter string ' + locationFilterString);
            settings.addCriteria('finan,tranline,klocation,x,alltranlineloc', locationFilterString);
        }

        if (params.department && params.department.id) {
            nlapiLogExecution('DEBUG', 'rl_cn_run_gl_report.js: reportSettings', 'department filter string ' + params.department.id);
            settings.addCriteria('finan,tranline,kdepartment,x,alltranline29', params.department.id);
        }

        if (params.clasz && params.clasz.id) {
            nlapiLogExecution('DEBUG', 'rl_cn_run_gl_report.js: reportSettings', 'class filter string ' + params.clasz.id);
            settings.addCriteria('finan,tranline,kclass,x,alltranline6', params.clasz.id);
        }

        nlapiLogExecution('DEBUG', 'rl_cn_run_gl_report.js: reportSettings', 'Report Settings: ' + JSON.stringify(params));
        return settings;
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
