/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define([
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../lib/commons'
],

/*
 * This file is for client caller script, note 'log' doesn't work here! For server-side script caller script, use incomerresource.js.
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
                NullPeriod : '\u672a\u5bf9\u6b64\u8d22\u653f\u65e5\u5386\u5b9a\u4e49\u671f\u95f4\u3002\u8bf7\u4f9d\u6b21\u8f6c\u5230\u201c\u8bbe\u7f6e\u201d\u0026\u0067\u0074\u003b\u201c\u4f1a\u8ba1\u201d\u0026\u0067\u0074\u003b\u201c\u7ba1\u7406\u4f1a\u8ba1\u671f\u95f4\u201d\uff0c\u7136\u540e\u8bbe\u7f6e\u6216\u6307\u5b9a\u6240\u9700\u671f\u95f4\u3002',
                RefreshPageRequest: '\u5f53\u524d\u9875\u9762\u8d85\u65f6\uff0c\u8bf7\u91cd\u65b0\u5237\u65b0\u62a5\u8868\u3002'
            },
            en_US: {
                Alert: 'Alert',
                Error: 'Error',
                NullReportName: 'Enter a value for Income Statement Name.',
                InvalidReportName: 'Enter a correct value for Income Statement Name.',
                ReportColumnsUnExpected: 'Income Statement Reports should have two amount columns defined using the Financial Report Builder.',
                EnableAdvancedPrint: 'The Advanced PDF/HTML Templates feature must be enabled in the account. To enable this feature, go to Setup > Company > Enable Features (SuiteCloud subtab).',
                NullPeriod: 'Accounting Period is not defined for this fiscal calendar. Go to Setup > Accounting > Manage Accounting Periods and set up or assign the period you need.',
                RefreshPageRequest: 'The current page timeout, please refresh the report.'
            }
        },
        informations: {
            zh_CN: {
                Loading: '\u6570\u636e\u52a0\u8f7d\u4e2d...'
            },
            en_US: {
                Loading: 'Loading...'
            }
        }
    };

    var names = {
        Errors: 'Errors',
        Informations: 'Informations'
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
