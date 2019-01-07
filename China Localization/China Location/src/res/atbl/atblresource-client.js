/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define([
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../lib/commons'
],

/*
 * This file is for client caller script, note 'log' doesn't work here! For server-side script caller script, use atblresource.js.
 */
function(runtime, commons) {

    var strings = {
        errors: {
            zh_CN: {
                Alert: '\u63d0\u793a',
                Error: '\u9519\u8bef\u000d\u000a',
                NullReportName: '\u8bf7\u8f93\u5165\u503c\uff1a\u5229\u6da6\u8868\u540d\u79f0\u3002',
                InvalidReportName: '\u8bf7\u8f93\u5165\u6b63\u786e\u7684\u5229\u6da6\u8868\u540d\u79f0\u3002',
                ReportColumnsUnExpected: '\u8bf7\u5728\u201c\u8d22\u52a1\u62a5\u8868\u751f\u6210\u5668\u201d\u4e3a\u5229\u6da6\u8868\u5b9a\u4e49\u4e24\u4e2a\u91d1\u989d\u5217\u3002',
                EnableAdvancedPrint: '\u9ad8\u7ea7PDF/HTML\u6a21\u677f \u529f\u80fd\u6ca1\u6709\u542f\u7528\u3002\u8bf7\u8bbf\u95ee\u201c\u8bbe\u7f6e>\u516c\u53f8>\u542f\u7528\u529f\u80fd>SuiteCloud\u201d\u5f00\u542f\u8be5\u529f\u80fd\u3002',
                RefreshPageRequest: '\u5f53\u524d\u9875\u9762\u8d85\u65f6\uff0c\u8bf7\u91cd\u65b0\u5237\u65b0\u62a5\u8868\u3002',
                InvalidAccount:'\u8bf7\u8f93\u5165\u4e00\u4e2a\u6709\u6548\u7684\u79d1\u76ee\u8303\u56f4\u3002\u8d77\u59cb\u79d1\u76ee\u5fc5\u987b\u5728\u622a\u6b62\u79d1\u76ee\u524d\u3002',
                InvalidDate:'\u8bf7\u8f93\u5165\u4e00\u4e2a\u6709\u6548\u7684\u65e5\u671f\u8303\u56f4\u3002\u8d77\u59cb\u65e5\u671f\u5fc5\u987b\u5728\u622a\u6b62\u65e5\u671f\u524d\u3002',
                ReportRowsExceedThreshold: '\u60A8\u7684\u641C\u7D22\u7ED3\u679C\u8D85\u8FC75000\u884C\uFF0C\u5F53\u524D\u9875\u9762\u65E0\u6CD5\u663E\u793A\u3002\u60A8\u53EF\u4EE5\u70B9\u51FBOK\u540E\u5BFC\u51FAexcel\u6216PDF\u6587\u4EF6\u6765\u83B7\u53D6\u62A5\u8868\u3002'
            },
            en_US: {
                Alert: 'Alert',
                Error: 'Error',
                NullReportName: 'Enter a value for China Account Balance Name.',
                InvalidReportName: 'Enter a correct value for China Account Balance Name.',
                ReportColumnsUnExpected: 'China Account Balance Reports should have two amount columns defined using the Financial Report Builder.',
                EnableAdvancedPrint: 'The Advanced PDF/HTML Templates feature must be enabled in the account. To enable this feature, go to Setup > Company > Enable Features (SuiteCloud subtab).',
                RefreshPageRequest: 'The current page timeout, please refresh the report.',
                InvalidAccount:'Please enter a valid account range. The From account must precede the To account.',
                InvalidDate:'Please enter a valid date range. The From date must precede the To date.',
                ReportRowsExceedThreshold: 'There are over 5000 rows in your result and can not display on current page. Please click OK and export the excel or PDF file to review the report.'
            }
        },
        informations: {
            zh_CN: {
                Loading: '\u6570\u636e\u52a0\u8f7d\u4e2d...'
            },
            en_US: {
                Loading: 'Loading...'
            }
        },
        header:{
            zh_CN: {
                Account: '\u79d1\u76ee\u000d\u000a',
                OpenBalanceDirection:'\u65b9\u5411',
                OpenBalanceAmount:'\u91d1\u989d',
                DebitAmount:'\u501f\u65b9',
                CreditAmount:'\u8d37\u65b9',
                CloseBalanceDirection:'\u65b9\u5411',
                CloseBalanceAmount:'\u91d1\u989d',
                OpeningBalance: '\u671f\u521d\u4f59\u989d',
                CurrentPeriod: '\u672c\u671f\u53d1\u751f\u989d',
                ClosingBalance:'\u671f\u672b\u4f59\u989d'

            },
            en_US: {
                Account: 'Account',
                OpenBalanceDirection:'Debit/Credit',
                OpenBalanceAmount:'Amount',
                DebitAmount:'Debit',
                CreditAmount:'Credit',
                CloseBalanceDirection:'Debit/Credit',
                CloseBalanceAmount:'Amount',
                OpeningBalance: 'Opening Balance',
                CurrentPeriod: 'Current Period',
                ClosingBalance:'Closing Balance'
            }
        }
    };

    var names = {
        Errors: 'Errors',
        Informations: 'Informations',
        Header: 'Header'
    };

    function language() {
        if (runtime.getUserLanguage() === 'zh_CN') {
            return 'zh_CN';
        } else {
            return 'en_US';
        }
    }

    function load(params) {
        if (!commons.makesure(params)) {
            return;
        }

        var name = commons.isPrimitive(params) ? params : params.name;
        var key = commons.isPrimitive(params) ? null : params.key;
        var defaultValue = commons.isPrimitive(params) ? null : params.defaultValue;

        var jsonObject = strings[name.toLowerCase()][language()];

        if (commons.makesure(key)) {
            if (commons.makesureall(jsonObject, key)) {
                return jsonObject[key];
            } else {
                return defaultValue;
            }
        }
        return jsonObject;
    }

    var resource = {
        load: load
    };

    Object.defineProperty(resource, 'Name', {
        enumerable: true,
        get: function() {
            return names;
        }
    });

    return resource;

});
