/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */

define([
    '../../lib/wrapper/ns_wrapper_record',
    '../../res/atbl/atblresource',
    '../../lib/commons',
    '../../lib/wrapper/ns_wrapper_encode',
    '../../lib/wrapper/ns_wrapper_url',
    '../../lib/wrapper/ns_wrapper_https',
    '../../lib/wrapper/ns_wrapper_format',
    '../../lib/wrapper/ns_wrapper_config',
    '../../dao/cn_extended_report_dao',
    '../helper/account_helper',
    '../../lib/letsdoauth'
],

function(record, resource, commons, encode, url, https, formatter, config, reportDao, accountHelper, letsdoauth) {
    var labels = resource.load(resource.Name.Labels);
    var filter;

    function getReportData(theFilter, reportDataId) {
        filter = theFilter;
        var reportDataObj = getCachedReportData(reportDataId);
        log.debug('app_cn_atbl_report_handler:getReportData', 'cachedReportData: ' + JSON.stringify(reportDataObj));
        var rows = handleRows(reportDataObj);
        var reportData = handleReportData(rows);
        log.debug('app_cn_atbl_report_handler:getReportData', 'reportData result: ' + JSON.stringify(reportData));
        return reportData;
    }

    function handleReportData(rows) {
        var body = {
            columnAccountName: labels.Account,
            columnOpeningBalanceName: labels.OpeningBalance,
            columnCurrentPeriodName: labels.CurrentPeriod,
            columnClosingBalanceName: labels.ClosingBalance,
            columnDirectionName: labels.CloseBalanceDirection,
            columnDebitName: labels.DebitAmount,
            columnCreditName: labels.CreditAmount,
            columnAmountName: labels.CloseBalanceAmount,
            rows: rows
        };

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
            body: body,
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

    function handleRows(reportDataObj) {
        var flatResultRows = traverseAllAndFilterAccountRange(reportDataObj, true);
        log.debug('app_cn_atbl_report_handler:getReportData', 'flatResultRows after filter account range: ' + JSON.stringify(flatResultRows));

        flatResultRows = flatResultRows.filter(withinLevel).filter(hasValidAmount);
        log.debug('app_cn_atbl_report_handler:getReportData', 'flatResultRows after other filter: ' + JSON.stringify(flatResultRows));

        flatResultRows = flatResultRows.sort(compareRows);
        log.debug('app_cn_atbl_report_handler:getReportData', 'flatResultRows after sort: ' + JSON.stringify(flatResultRows));

        var rows = flatResultRows.map(formatRow);
        log.debug('app_cn_atbl_report_handler:getReportData', 'result rows: ' + JSON.stringify(rows));

        return rows;
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
    
    function getRealSubsidiaryId(subsidiary){
        var subsidiaryId = commons.ensure(subsidiary) ? subsidiary.id : null;
        subsidiaryId = commons.makesure(subsidiaryId) && commons.isArray(JSON.parse(subsidiaryId)) ? JSON.parse(subsidiaryId)[1] : subsidiaryId;
        return subsidiaryId;
    }

    function traverseAllAndFilterAccountRange(trees, check) {
        var flatResult = [];

        if (!commons.makesure(trees)) {
            return flatResult;
        }
        for (var i = 0; i < trees.length; i++) {
            flatResult = flatResult.concat(traverseAndFilterAccountRange(trees[i], check));
        }
        return flatResult;

    }

    function traverseAndFilterAccountRange(node, check) {
        var result = [];
        if (!commons.makesure(node)) {
            return result;
        }

        if (!check || inRange(node)) {
            result.push(cloneWithoutChildren(node));
        }
        var children;
        if (check && isTo(node)) {
            children = traverseAllAndFilterAccountRange(node.children, false);
        } else {
            children = traverseAllAndFilterAccountRange(node.children, check);
        }

        result = result.concat(children);

        return result;
    }

    /*
     * copy row properties, skip children
     * @param row
     * @returns
     */
    function cloneWithoutChildren(row) {
        var result = {};
        for ( var key in row) {
            if (key !== 'children') {
                result[key] = row[key];
            }
        }
        return result;

    }

    function withinLevel(row) {
        var accountlevelFilter = filter.accountlevel.id;

        switch (accountlevelFilter) {
            case 'tofirst':
                return row.level === 1;
            case 'onlylast':
                return row.last;
            case 'tolast':
            default:
                return true;
        }
    }


    function isTo(row) {
        return compareAccounts(row.account, filter.account.to.name) === 0;
    }

    function inRange(row) {
        var from = filter.account.from, to = filter.account.to;
        if (!commons.makesureall(from, 'name') && !commons.makesureall(to, 'name')) {
            return true;
        }
        if (!commons.makesureall(from, 'name')) {
            return compareAccounts(row.account, to.name) <= 0;
        }
        if (!commons.makesureall(to, 'name')) {
            return compareAccounts(row.account, from.name) >= 0;
        }
        return compareAccounts(from.name, row.account) <= 0 && compareAccounts(row.account, to.name) <= 0;
    }

    function compareRows(row1, row2) {
        return compareAccounts(row1.account, row2.account);
    }

    function compareAccounts(account1, account2) {
        var account1HasNumber = hasNumber(account1), account2HasNumber = hasNumber(account2);

        if (!account1HasNumber && !account2HasNumber) {
            return getName(account1).localeCompare(getName(account2));
        } else if (account1HasNumber && !account2HasNumber) {
            return -1;
        } else if (!account1HasNumber) {
            return 1;
        }

        return getNumber(account1).localeCompare(getNumber(account2));
    }

    function hasValidAmount(row) {
        var amountProperties = [
            'opening',
            'debit',
            'credit',
            'closing'
        ];
        var isNotZero = function(key) {
            return commons.makesure(row[key]) && formatter.round(Number(row[key])) !== 0;
        };
        return amountProperties.some(isNotZero);
    }

    function getNumber(account) {
        return hasNumber(account) ? account.split('-')[0].trim() : '';
    }

    function getName(account) {
        var name = hasNumber(account) ? account.split('-').slice(1).join("").trim() : account;
        var indexOfColon = name.lastIndexOf(':');
        return indexOfColon >= 0 && indexOfColon < name.length - 1 ? name.substr(indexOfColon + 1).trim() : name.trim();
    }

    function hasNumber(account) {
        return account.indexOf('-') >= 0 && isNumber(account.split('-')[0].trim());
    }

    function isNumber(value) {
        return value.match(/^[0-9.]+$/);
    }
    /*
     * format row
     * from
     *  {  account: '1001 - Cash',
     *     opening:  100,
     *     debit:    100,
     *     credit:   100,
     *     closing:  100,
     *     level:    1 ,
     *     last:     false,
     *  }
     *
     * to
     * {   account : '1001 - Cash',
     *     openingBalance :  {direction: 'Debit', amount: 100},
     *     currentPeriod :   {debit: 100, credit: 100},
     *     closingBalance :  {direction: 'Debit', amount: 100}
     *  }
     */
    function formatRow(row) {
        //ignore children
        return {
            account: account(row.account),
            openingBalance: {
                direction: directionOf(row.opening),
                amount: formatReportCurrency(Math.abs(row.opening))
            },
            currentPeriod: {
                debit: formatReportCurrency(row.debit),
                credit: formatReportCurrency(row.credit)
            },
            closingBalance: {
                direction: directionOf(row.closing),
                amount: formatReportCurrency(Math.abs(row.closing))
            }
        };
    }

    function directionOf(amount) {
        switch (commons.sign(formatter.round(amount))) {
            case 1:
                return labels.Debit;
            case -1:
                return labels.Credit;
            case 0:
            default:
                return labels.Balance;
        }
    }

    function getCachedReportData(reportDataId) {
        var reportData = record.load({
            type: 'customrecord_cn_atbl_report_data',
            id: reportDataId
        });

        return JSON.parse(encode.convert({
            string: reportData.getValue('custrecord_cn_atbl_reportdata'),
            inputEncoding: encode.Encoding.BASE_64,
            outputEncoding: encode.Encoding.UTF_8
        }));

    }

    function formatReportCurrency(currency) {
        return commons.makesure(currency) ? formatter.formatCurrency(currency) : '';
    }

    function auth(authInfo, hashFunction) {
        var that = this;

        function getReportData(filter) {
            var rlURL = url.resolveScript({
                scriptId: 'customscript_rl_cn_run_atbl_report',
                deploymentId: 'customdeploy_rl_cn_run_atbl_report',
                returnExternalUrl: true,
                params: {
                    filter: JSON.stringify(filter)
                }
            });
            authInfo.url = rlURL;
            authInfo.method = 'GET';
            log.debug('app_cn_atbl_report_handler.js: Authorization', 'authInfo=' + JSON.stringify(authInfo) + ' hashFunction=' + hashFunction);

            var response = https.get({
                url: rlURL,
                headers: {
                    'Authorization': authInfo.isoauth ? letsdoauth.oAuth(authInfo, hashFunction) : letsdoauth.basicAuth(authInfo)
                }
            });
            log.debug('app_cn_atbl_report_handler.js: auth.getReportData', 'response ' + response.body);

            var responseObj = JSON.parse(response.body);
            return that.getReportData(filter, responseObj.reportDataId);
        }
        return {
            getReportData: getReportData
        };
    }

    var theAllAccounts = {};

    function account(reportStyledAccountName/* like '1000 - Checking' */) {
        if (!commons.makecertain(theAllAccounts)) {
            setup();
            var results = reportDao.fetchAccounts();
            tearDown();
            for (var i = 0; i < results.length; i++) {
                var number = results[i].getValue('number');
                var name = results[i].getValue('name'); // like '1000 Checking'
                var props = accountHelper.resolve({
                    number: number,
                    name: name
                }, accountHelper.nameNoHierarchy);
                name = accountName(props); // like '1000 - Checking'
                theAllAccounts[name] = {id: results[i].id, name: name, type: results[i].getValue('type')};
            }
            log.debug('app_cn_atbl_report_handler.js: account().theAllAccounts', theAllAccounts);
        }
        return theAllAccounts[commons.trim(reportStyledAccountName)];
    }

    function accountName(props) {
        if(commons.makesure(props.number)) {
            if(commons.makesure(props.name)) {
                return props.number + ' - ' + props.name; // like '1000 - Checking'
            } else {
                return number; // like '1000'
            }
        } else {
            return props.name; // like 'Checking'
        }
    }

    var thePrefChanged = false;

    function setup() {
        if (!config.onlyShowLastSubaccount()) {
            config.setOnlyShowLastSubaccount(true);
            thePrefChanged = true;
        }
    }

    function tearDown() {
        if (thePrefChanged) {
            config.setOnlyShowLastSubaccount(!config.onlyShowLastSubaccount());
        }
    }

    return {
        auth: auth,
        getReportData: getReportData
    };

});
