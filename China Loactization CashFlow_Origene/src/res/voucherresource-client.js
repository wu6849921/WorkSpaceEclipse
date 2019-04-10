/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define([
    '../lib/wrapper/ns_wrapper_runtime',
    '../lib/commons'
],

/*
 * This file is for client caller script, note 'log' doesn't work here! For server-side script caller script, use voucherresource.js.
 */
function(runtime, commons) {

    var strings = {
        errors: {
            zh_CN: {
                Alert: '\u63d0\u793a',
                Error: '\u9519\u8bef\u000d\u000a',
                InvalidDateRange: '\u8d77\u59cb\u65e5\u671f\u987b\u65e9\u4e8e\u622a\u81f3\u65e5\u671f\u3002',
                InvalidPeriodRange: '\u8d77\u59cb\u671f\u95f4\u987b\u65e9\u4e8e\u622a\u81f3\u671f\u95f4\u3002',
                PDFReportBackgroundPrintMessage: '\u6b64\u62a5\u8868\u751f\u6210\u53ef\u80fd\u8981\u82b1\u4e00\u6bb5\u65f6\u95f4\u3002\u62a5\u8868\u751f\u6210\u5e76\u4e14\u53ef\u4ee5\u67e5\u770b\u65f6\u5373\u4f1a\u901a\u77e5\u60a8\u3002',
                DateRangeCrossFiscalYear: '\u8bf7\u8f93\u5165\u4e00\u4e2a\u6709\u6548\u7684\u65e5\u671f\u8303\u56f4\u3002\u4e0d\u5141\u8bb8\u8de8\u8d22\u653f\u5e74\u5ea6\u3002',
                NoPeriodSelected: '\u6ca1\u6709\u9009\u62e9\u6709\u6548\u7684\u671f\u95f4\u3002',
                ConfirmButton: '\u786e\u5b9a',
                CancelButton: '\u53d6\u6d88',
                InvalidStartOrEndDate: '\u8d77\u59cb\u65e5\u671f\u9700\u65e9\u4e8e\u622a\u81f3\u65e5\u671f\u3002',
                InvalidPeriod: '\u65e5\u671f\u8303\u56f4\u91cd\u53e0\u3002\u5bf9\u4e8e\u540c\u4e00\u7528\u6237\u7c7b\u578b\u3001\u4ea4\u6613\u7c7b\u578b\u548c\u7528\u6237\u7ec4\u5408\u7684\u884c\uff0c\u9700\u8981\u5728\u5f53\u524d\u884c\u8f93\u5165\u622a\u81f3\u65e5\u671f\uff0c\u518d\u7f16\u8f91\u5176\u4ed6\u7528\u6237\u3002',
                InvaildDelete: '\u60a8\u4e0d\u80fd\u5220\u9664\u5df2\u4fdd\u5b58\u7684\u8bb0\u5f55\u3002\u4ec5\u5b57\u6bb5\u201c\u7ed3\u675f\u65e5\u671f\u201d\u7684\u5f53\u524d\u503c\u5927\u4e8e\u6216\u7b49\u4e8e\u5f53\u524d\u65e5\u671f\u65f6\u53ef\u7f16\u8f91\u3002',
                NullPeriod : '\u672a\u5bf9\u6b64\u8d22\u653f\u65e5\u5386\u5b9a\u4e49\u65e5\u671f\u3002\u8bf7\u4f9d\u6b21\u8f6c\u5230\u201c\u8bbe\u7f6e\u0026\u0067\u0074\u003b\u4f1a\u8ba1\u0026\u0067\u0074\u003b\u7ba1\u7406\u4f1a\u8ba1\u671f\u95f4\u201d\uff0c\u7136\u540e\u8bbe\u7f6e\u6216\u6307\u5b9a\u6240\u9700\u671f\u95f4\u3002\u000d\u000a',
                CashflowItemCannotBeEmpty: '\u8bf7\u8f93\u5165\u503c\uff1a\u4e2d\u56fd\u73b0\u91d1\u6d41\u91cf\u8868\u9879\u76ee'
            },
            en_US: {
                Alert: 'Alert',
                Error: 'Error',
                InvalidDateRange: 'Select a start date that is earlier than the end date.',
                InvalidPeriodRange: 'Select a start period that is earlier than the end period.',
                PDFReportBackgroundPrintMessage: 'This report may take some time to generate. You will be alerted once the report is generated and available for viewing.',
                DateRangeCrossFiscalYear: 'Please enter a valid date range. It is not allowed to cross fiscal year.',
                NoPeriodSelected: 'There is no valid period to generate the report.',
                ConfirmButton: 'OK',
                CancelButton: 'Cancel',
                InvalidStartOrEndDate: "Select a start date that is earlier than the end date.",
                InvalidPeriod: "Overlapping date range. To edit a Line with the same Type, Transaction Type, and User, you need to select an End Date on your current Line, then manage another user.",
                InvaildDelete: "You cannot delete a saved record. You can only edit the End Date field if the current value is equal to or later than the current date.",
                NullPeriod :"Accounting Period is not defined for this fiscal calendar. Go to \"Setup > Accounting > Manage Accounting Periods\" and set up or assign the period you need.",
                CashflowItemCannotBeEmpty:"Please enter value(s) for: China Cash Flow Item"
            }
        }
    };

    var names = {
        Errors: 'Errors'
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

        var name = commons.isPrimitive(params)
            ? params : params.name;
        var key = commons.isPrimitive(params)
            ? null : params.key;
        var defaultValue = commons.isPrimitive(params)
            ? null : params.defaultValue;

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
