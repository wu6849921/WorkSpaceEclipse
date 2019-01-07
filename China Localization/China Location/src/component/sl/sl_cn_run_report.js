/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 May 2017     jiem
 *
 */
var closingColumn = null;
var openingColumn = null;
var curAssetArray;
var fixAssetArray;
var totalAsset;
var totalFixAsset;
var totalCurAsset;
var curLiaArray;
var totalCurLia;
var noncurLiaArray;
var totalNoncurLia;
var totalLia;
var equityArray;
var totalEquity;
var totalLiaEquity;
var curAssetFinalArray = [];
var fixAssetFinalArray = [];
var curLiaFinalArray = [];
var noncurLiaFinalArray = [];
var equityFinalArray = [];

var colonLabel = {
    'cnColon': '：',
    'usColon': ':'
};
var labelNameCN = 'blsheet_labels_zh_CN.json';
var labelNameUS = 'blsheet_labels_en_US.json';
var labelName = 'blsheet_labels_';
var headerUS;
var headerCN;
var colLabelUS;
var colLabelCN;
var labelCN;
var labelUS;

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */

if (!BLS) {
    var BLS = {};
}
BLS.REPORT = BLS.REPORT || {};

BLS.REPORT.runReport = function() {
};

BLS.REPORT.runReport.prototype.suitelet = function(request, response) {
    //get parameters from request
    var periodId = request.getParameter('periodId');
    if (periodId == null) {
        return;
    }


    var subsidiaryId = request.getParameter('subsidiaryId');
    var bookId = request.getParameter('bookId');
    var reportId = request.getParameter('reportId');
    if (subsidiaryId == null || reportId == null) {
        return;
    }
    this.getLabels();
    if (colLabelCN == null && colLabelUS == null) {
        return;
    }
    //change user pref temporarily, to be changed when the periodId bug is fixed
    var userPref = nlapiLoadConfiguration('userpreferences');
    var langPref = userPref.getFieldValue('language');
    var reportPref = userPref.getFieldValue('reportbyperiod');
    nlapiLogExecution('DEBUG', 'SL_CN_RUN_REPORT', 'reportPref is ' + reportPref);
    if (reportPref !== 'FINANCIALS') {
        userPref.setFieldValue('reportbyperiod', 'FINANCIALS');
        nlapiSubmitConfiguration(userPref);
    }
    //run report to get opening balance of start date
    var reportSettings = new nlobjReportSettings(periodId, periodId);
    reportSettings.setSubsidiary(parseInt(subsidiaryId));

    if (request.getParameter('locationId')) {
        nlapiLogExecution('DEBUG', 'SL_CN_RUN_REPORT', 'location filter string ', request.getParameter('locationId'));
        reportSettings.addCriteria('finan,tranline,klocation,x,alltranlineloc', request.getParameter('locationId'));
    }

    if (request.getParameter('departmentId')) {
        nlapiLogExecution('DEBUG', 'SL_CN_RUN_REPORT', 'department filter string ', request.getParameter('departmentId'));
        reportSettings.addCriteria("finan,tranline,kdepartment,x,alltranline29", request.getParameter('departmentId'));
    }

    if (request.getParameter('classId')) {
        nlapiLogExecution('DEBUG', 'SL_CN_RUN_REPORT', 'class filter string ', request.getParameter('classId'));
        reportSettings.addCriteria("finan,tranline,kclass,x,alltranline6", request.getParameter('classId'));
    }

    try {
        this.runReport(reportId, reportSettings, true, true);
        var resultObj = this.composeRetJsonObj(langPref);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'SL_CN_RUN_REPORT', 'runreport api failed with param reportId: ' + reportId + ', periodId: ' + periodId + ', subsidiaryId: ' + subsidiaryId + ', bookId: ' + bookId + ', message:' + ex.message);
        var errormsg = this.compressHtmlTag(ex.message);
        resultObj = this.composeExceptionObj(errormsg);
    }

    var reportRecord = nlapiCreateRecord('customrecord_cn_blsheet_data');
    var timeStamp = new Date();
    reportRecord.setFieldValue('name', timeStamp.getTime());
    reportRecord.setFieldValue('custrecord_cn_blsheet_data_record', JSON.stringify(resultObj.data));
    var id = nlapiSubmitRecord(reportRecord, true);
    var result = {};
    result.id = id;
    result.errmsg = resultObj.errmsg;
    nlapiLogExecution('DEBUG', 'SL_CN_RUN_REPORT', 'runreport data Id is ' + id);
    response.write(JSON.stringify(result));
    //change user preference back
    if (reportPref !== 'FINANCIALS') {
        userPref.setFieldValue('reportbyperiod', reportPref);
        nlapiSubmitConfiguration(userPref);
    }
}

/**
 * @desc build multi-select filter string.
 */
BLS.REPORT.runReport.prototype.buildMultiSelectFilterString = function(selectedOptionString) {
    var filterString = '';
    if (selectedOptionString) {
        var selectedOptionObj = JSON.parse(selectedOptionString);
        for (var i = 0; i < selectedOptionObj.length; i++) {
            if (i !== selectedOptionObj.length - 1) {
                //append the unicode of 'ENQ' between selected options to build the filter string for nlapiRunReport
                filterString += selectedOptionObj[i] + '\u0005';
            } else {
                filterString += selectedOptionObj[i];
            }
        }
    }
    return filterString;
}

/**
 * @desc convert result to array.
 */
BLS.REPORT.runReport.prototype.convertResultObjToArray = function() {
    for ( var curAssetIdx in curAssetArray) {
        curAssetFinalArray.push(curAssetArray[curAssetIdx]);
    }
    for ( var fixAssetIdx in fixAssetArray) {
        fixAssetFinalArray.push(fixAssetArray[fixAssetIdx]);
    }
    for ( var curLiaIdx in curLiaArray) {
        curLiaFinalArray.push(curLiaArray[curLiaIdx]);
    }
    for ( var noncurLiaIdx in noncurLiaArray) {
        noncurLiaFinalArray.push(noncurLiaArray[noncurLiaIdx]);
    }
    for ( var equityIdx in equityArray) {
        equityFinalArray.push(equityArray[equityIdx]);
    }
}

/**
 *
 */
BLS.REPORT.runReport.prototype.composeExceptionObj = function(message) {
    var result = {};
    result.data = {};
    result.errmsg = {};
    result.errmsg.exception = message;
    //message;
    return result;

}

/**
 * @desc remove html tag in API calling exceptions to form a well structured JSON exception object via response.write
 * @param [msg] - Exception messages returned from API call
 * @return Exception message without any html tag
 */
BLS.REPORT.runReport.prototype.compressHtmlTag = function(msg) {

    nlapiLogExecution('ERROR', 'SL_CN_RUN_REPORT', 'runreport error message ' + msg);
    
    if(msg) {
        var originmsg = msg;
        var result = originmsg.replace(/&quot;/g, "\"").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/<\/?[^>]+(>|$)/g, "");
        return result;
    }
    else
        return msg;
}

/**
 * @desc compose the returned balance results.
 * @param [langPref] - language prefix.
 * @return compose result.
 */
BLS.REPORT.runReport.prototype.composeRetJsonObj = function(langPref) {
    this.convertResultObjToArray();
    var result = {};
    result.data = {};

    var assetValue = {};
    result.data.asset = assetValue;
    assetValue.curasset = curAssetFinalArray;
    assetValue.total_curasset = totalCurAsset == null ? {
        ob: '',
        cb: ''
    } : totalCurAsset;
    assetValue.fixasset = fixAssetFinalArray;
    assetValue.total_fixasset = totalFixAsset == null ? {
        ob: '',
        cb: ''
    } : totalFixAsset;
    result.data.totalasset = totalAsset == null ? {
        ob: '',
        cb: ''
    } : totalAsset;

    var liaequValue = {};
    var liaValue = {};
    liaValue.curlia = curLiaFinalArray;
    liaValue.total_curlia = totalCurLia == null ? {
        ob: '',
        cb: ''
    } : totalCurLia;
    liaValue.noncurlia = noncurLiaFinalArray;
    liaValue.total_noncurlia = totalNoncurLia == null ? {
        ob: '',
        cb: ''
    } : totalNoncurLia;
    liaequValue.lia = liaValue;
    liaequValue.total_lia = totalLia == null ? {
        ob: '',
        cb: ''
    } : totalLia;
    liaequValue.equ = equityFinalArray;
    liaequValue.total_equ = totalEquity == null ? {
        ob: '',
        cb: ''
    } : totalEquity;
    result.data.liaequ = liaequValue;
    result.data.total_liaequ = totalLiaEquity == null ? {
        ob: '',
        cb: ''
    } : totalLiaEquity;


    var missingCols = this.getMissingCols(langPref);
    var missingRows = this.getMissingRows(langPref);
    if (missingCols != null || missingRows != null) {
        result.errmsg = {};
        if (missingCols != null) {
            result.errmsg.missingcols = missingCols;
        }
        if (missingRows != null) {
            result.errmsg.missingrows = missingRows;
        }
    }
    return result;
}

/**
 * @desc get labels from multiple language files.
 */
BLS.REPORT.runReport.prototype.getLabels = function() {
    try {
        var labelFiles = nlapiSearchRecord('file', null, new nlobjSearchFilter('name', null, 'startswith', labelName), new nlobjSearchColumn('name'));
        var labelFileIdCN = null;
        var labelFileIdUS = null;
        for ( var i in labelFiles) {
            if (labelFiles[i].getValue('name') === labelNameCN) {
                labelFileIdCN = labelFiles[i].getId();
            } else if (labelFiles[i].getValue('name') === labelNameUS) {
                labelFileIdUS = labelFiles[i].getId();
            }
        }
        if (labelFileIdCN != null) {
            var labelFileCN = nlapiLoadFile(labelFileIdCN);
            labelCN = JSON.parse(labelFileCN.getValue());
            headerCN = {
                'curasset': labelCN.data.currentassets.label,
                'fixasset': labelCN.data.noncurrentassets.label,
                'totalasset': labelCN.data.totalassets.label,
                'curlia': labelCN.data.currentliabil.label,
                'noncurlia': labelCN.data.noncurrentliabil.label,
                'equ': labelCN.data.equity.label,
                'totalliaequ': labelCN.data.totalliabequity.label,
                'totallia': labelCN.data.totalliability.label
            };
            colLabelCN = {
                'openingBalance': labelCN.tableHeader.openingBalance,
                'closingBalance': labelCN.tableHeader.closingBalance
            };
        }
        if (labelFileIdUS != null) {
            var labelFileUS = nlapiLoadFile(labelFileIdUS);
            labelUS = JSON.parse(labelFileUS.getValue());
            headerUS = {
                'curasset': labelUS.data.currentassets.label.toUpperCase(),
                'fixasset': labelUS.data.noncurrentassets.label.toUpperCase(),
                'totalasset': labelUS.data.totalassets.label.toUpperCase(),
                'curlia': labelUS.data.currentliabil.label.toUpperCase(),
                'noncurlia': labelUS.data.noncurrentliabil.label.toUpperCase(),
                'equ': labelUS.data.equity.label.toUpperCase(),
                'totalliaequ': labelUS.data.totalliabequity.label.toUpperCase(),
                'totallia': labelUS.data.totalliability.label.toUpperCase()
            };
            colLabelUS = {
                'openingBalance': labelUS.tableHeader.openingBalance.toUpperCase(),
                'closingBalance': labelUS.tableHeader.closingBalance.toUpperCase()
            };
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'SL_CN_RUN_REPORT', 'Failed to parse label files. Error: ' + ex.message);
    }
}

/**
 * @desc parse the row name and determine how to get balance results.
 * @param {string} [rowName] - row name.
 * @return {object} - balance sheet data.
 */
BLS.REPORT.runReport.prototype.resolveRowName = function(rowName) {
    if (rowName.indexOf(colonLabel.cnColon, rowName.length - 1) >= 0 || rowName.indexOf(colonLabel.usColon, rowName.length - 1) >= 0) {
        rowName = rowName.substring(0, rowName.length - 1);
    }
    var retObj = {};
    retObj.parseChildren = true;
    switch (rowName.toUpperCase()) {
        case headerUS.curasset:
        case headerCN.curasset:
            if (totalCurAsset == null) {
                curAssetArray = {};
                totalCurAsset = {};
            }
            retObj.array = curAssetArray;
            retObj.object = totalCurAsset;
            retObj.parseChildren = false;
            break;
        case headerUS.fixasset:
        case headerCN.fixasset:
            if (totalFixAsset == null) {
                fixAssetArray = {};
                totalFixAsset = {};
            }
            retObj.array = fixAssetArray;
            retObj.object = totalFixAsset;
            retObj.parseChildren = false;
            break;
        case headerUS.totalasset:
        case headerCN.totalasset:
            if (totalAsset == null) {
                totalAsset = {};
            }
            retObj.object = totalAsset;
            retObj.parseChildren = false;
            break;
        case headerUS.curlia:
        case headerCN.curlia:
            if (totalCurLia == null) {
                curLiaArray = {};
                totalCurLia = {};
            }
            retObj.array = curLiaArray;
            retObj.object = totalCurLia;
            retObj.parseChildren = false;
            break;
        case headerUS.noncurlia:
        case headerCN.noncurlia:
            if (totalNoncurLia == null) {
                noncurLiaArray = {};
                totalNoncurLia = {};
            }
            retObj.array = noncurLiaArray;
            retObj.object = totalNoncurLia;
            retObj.parseChildren = false;
            break;
        case headerUS.totallia:
        case headerCN.totallia:
            if (totalLia == null) {
                totalLia = {};
            }
            retObj.object = totalLia;
            retObj.parseChildren = false;
            break;
        case headerUS.equ:
        case headerCN.equ:
            if (totalEquity == null) {
                equityArray = {};
                totalEquity = {};
            }
            retObj.array = equityArray;
            retObj.object = totalEquity;
            retObj.parseChildren = false;
            break;
        case headerUS.totalliaequ:
        case headerCN.totalliaequ:
            if (totalLiaEquity == null) {
                totalLiaEquity = {};
            }
            retObj.object = totalLiaEquity;
            retObj.parseChildren = false;
            break;
    }
    return retObj;
}

/**
 * @desc call the run report api and get balance sheet results.
 * @param {number} [reportId] - report id. 
 * @param {object} [reportSettings] - report setting. 
 * @param {bool} [getOpeningBalance] - get opening balance 'ob' or not. 
 * @param {bool} [getClosingBalance] - get closing balance 'cb' or not.
 */
BLS.REPORT.runReport.prototype.runReport = function(reportId, reportSettings, getOpeningBalance, getClosingBalance) {
    var pivotTable = nlapiRunReport(parseInt(reportId), reportSettings);
    //get report columns definition
    var colHier = pivotTable.getColumnHierarchy();
    var colChildren = colHier.getVisibleChildren();
    for ( var colIdx in colChildren) {
        if (colChildren[colIdx].getLabel().indexOf(colLabelCN.closingBalance) === 0 || colChildren[colIdx].getLabel().toUpperCase().indexOf(colLabelUS.closingBalance) === 0) {
            closingColumn = colChildren[colIdx];
        } else if (colChildren[colIdx].getLabel().indexOf(colLabelCN.openingBalance) === 0 || colChildren[colIdx].getLabel().toUpperCase().indexOf(colLabelUS.openingBalance) === 0) {
            openingColumn = colChildren[colIdx];
        }
    }
    //parse report to get returned result
    var rowHier = pivotTable.getRowHierarchy();
    this.parseRowChildren(rowHier.getChildren(), getOpeningBalance, getClosingBalance);
}

/**
 * @desc parse the report result rows using iteration.
 * @param {object} [rowChildren] - row children to be parse. 
 * @param {bool} [getOpeningBalance] - get opening balance 'ob' or not.
 * @param {bool} [getClosingBalance] - get closing balance 'cb' or not.
 */
BLS.REPORT.runReport.prototype.parseRowChildren = function(rowChildren, getOpeningBalance, getClosingBalance) {
    if (rowChildren == null) {
        return;
    }
    for ( var rowIdx in rowChildren) {
        var rowChild = rowChildren[rowIdx];
        var accountName = rowChild.getValue();
        if (accountName == null) {
            continue;
        }
        var rowObj = this.resolveRowName(accountName.trim());
        if (rowObj.parseChildren) {
            this.parseRowChildren(rowChild.getChildren(), getOpeningBalance, getClosingBalance);
        }
        var summaryLine = rowChild.getSummaryLine();
        var sumOpeningBalance;
        if (openingColumn != null) {
            sumOpeningBalance = summaryLine.getValue(openingColumn);
        }
        var sumClosingBalance;
        if (closingColumn != null) {
            sumClosingBalance = summaryLine.getValue(closingColumn);
        }
        if (isNaN(sumOpeningBalance)) {
            sumOpeningBalance = "";
        }
        if (isNaN(sumClosingBalance)) {
            sumClosingBalance = "";
        }
        if (rowObj.object != null) {
            if (getOpeningBalance) {
                rowObj.object['ob'] = sumOpeningBalance;
            }
            if (getClosingBalance) {
                rowObj.object['cb'] = sumClosingBalance;
            }
        }
        if (rowObj.array != null) {
            var children = rowChild.getChildren();
            if (children != null) {
                for ( var idx in children) {
                    var child = children[idx];
                    var name = child.getValue();
                    if (name == null) {
                        continue;
                    }
                    if (rowObj.array[name] == null) {
                        rowObj.array[name] = {};
                        rowObj.array[name]['an'] = name;
                    }
                    var summary = child.getSummaryLine();
                    var openBalanceValue;
                    if (openingColumn != null) {
                        openBalanceValue = isNaN(summary.getValue(openingColumn)) ? "" : summary.getValue(openingColumn);
                    } else {
                        openBalanceValue = "";
                    }
                    var closeBalanceValue;
                    if (closingColumn != null) {
                        closeBalanceValue = isNaN(summary.getValue(closingColumn)) ? "" : summary.getValue(closingColumn);
                    } else {
                        closeBalanceValue = "";
                    }
                    if (getOpeningBalance) {
                        rowObj.array[name]['ob'] = openBalanceValue;
                    }
                    if (getClosingBalance) {
                        rowObj.array[name]['cb'] = closeBalanceValue;
                    }
                }
            }
        }
    }
}

/**
 * @desc get missing rows according to language.
 * @param {string} [langPref] - language prefix.
 * @return {array} - missing rows.
 */
BLS.REPORT.runReport.prototype.getMissingRows = function(langPref) {
    var label = langPref === 'zh_CN' ? labelCN : labelUS;
    var missingRows = [];
    if (totalCurAsset == null) {
        missingRows.push(label.data.currentassets.label);
    }
    if (totalFixAsset == null) {
        missingRows.push(label.data.noncurrentassets.label);
    }
    if (totalAsset == null) {
        missingRows.push(label.data.totalassets.label);
    }
    if (totalCurLia == null) {
        missingRows.push(label.data.currentliabil.label);
    }
    if (totalNoncurLia == null) {
        missingRows.push(label.data.noncurrentliabil.label);
    }
    if (totalLia == null) {
        missingRows.push(label.data.totalliability.label);
    }
    if (totalEquity == null) {
        missingRows.push(label.data.equity.label);
    }
    if (totalLiaEquity == null) {
        missingRows.push(label.data.totalliabequity.label);
    }
    if (missingRows.length > 0) {
        return missingRows.join(',');
    } else {
        return null;
    }
}

/**
 * @desc get missing column according to language.
 * @param {string} [langPref] - language prefix.
 * @return {array} - missing columns.
 */
BLS.REPORT.runReport.prototype.getMissingCols = function(langPref) {
    var result = [];
    var label;
    if (langPref === 'zh_CN') {
        label = labelCN;
    } else {
        label = labelUS;
    }
    if (openingColumn == null) {
        result.push(label.tableHeader.openingBalance);
    }
    if (closingColumn == null) {
        result.push(label.tableHeader.closingBalance);
    }
    if (result.length > 0) {
        return result.join(',');
    } else {
        return null;
    }
}
