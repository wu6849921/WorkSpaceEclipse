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
 * This file is for client caller script, note 'log' doesn't work here! For server-side script caller script, use incomerresource.js.
 */
function(runtime, commons) {

    var strings = {
        errors: {
            zh_CN: {
                Error: '\u9519\u8bef\u000d\u000a',
                Warning: '\u8b66\u544a',
                NoValidTranToMerge: '\u6ca1\u6709\u53ef\u5408\u5e76\u7684\u4e8b\u52a1\u5904\u7406\u3002',
                NoSummaryTransToUnmerge: '<b>\u4e0d\u80fd\u53d6\u6d88\u5408\u5e76</b>\u3002\u8bf7\u91cd\u65b0\u9009\u62e9\u5df2\u5408\u5e76\u7684\u5408\u8ba1\u884c\u8fdb\u884c\u62c6\u5206\u3002',
                ConsolidatedSplitTranCannotMerge: '<b>\u4e0d\u80fd\u5408\u5e76</b>\u3002\u5df2\u5408\u5e76/\u62c6\u5206\u7684\u4e8b\u52a1\u5904\u7406\u4e0d\u80fd\u518d\u6b21\u5408\u5e76\uff0c\u8bf7\u53d6\u6d88\u9009\u62e9\u5df2\u5408\u5e76\u7684\u4e8b\u52a1\u5904\u7406\u540e\u91cd\u8bd5\u3002',
                TotalAmountExceedMax: '<b>\u4e0d\u80fd\u5408\u5e76</b>\u3002\u6240\u9009\u4e8b\u52a1\u5904\u7406\u8d85\u8fc7<b>\u6700\u5927\u5f00\u7968\u9650\u989d</b>{$maxAmount}\u3002',
                MergeDifferentCustomers: '<b>\u4e0d\u80fd\u5408\u5e76</b>\u3002\u53ea\u6709\u76f8\u540c\u5ba2\u6237\u7684\u4e8b\u52a1\u5904\u7406\u53ef\u4ee5\u5408\u5e76\u3002',
                DifferentSheetNumber: '<b>\u4e0d\u80fd\u5408\u5e76</b>\u3002\u88ab\u5408\u5e76\u7684\u8d1f\u6570\u4e8b\u52a1\u5904\u7406\u5fc5\u987b\u6709\u76f8\u540c\u7684<b>\u7ea2\u5b57\u53d1\u7968\u4fe1\u606f\u8868\u7f16\u53f7</b>\u3002',
                DifferentVATCodeAndNumber: '<b>\u4e0d\u80fd\u5408\u5e76</b>\u3002\u88ab\u5408\u5e76\u7684\u8d1f\u6570\u4e8b\u52a1\u5904\u7406\u5fc5\u987b\u6709\u76f8\u540c\u7684\u5907\u6ce8\u680f\u4fe1\u606f\uff08\u6b63\u5411\u589e\u503c\u7a0e\u7684<b>\u53d1\u7968\u4ee3\u7801\u3001\u53d1\u7968\u53f7\u7801</b>\uff09\u3002',
                BlankSheetNumber: '\u8be5\u53d1\u7968\u65e0\u7ea2\u5b57\u53d1\u7968\u4fe1\u606f\u8868\u7f16\u53f7\u6216\u5907\u6ce8\u680f\u683c\u5f0f\u4e0d\u6b63\u786e\u3002',
                NoAppliedVAT: '\u65e0\u6548\u683c\u5f0f\u3002\u8bf7\u5148\u6838\u9500\u5bf9\u5e94\u7684\u6b63\u5411\u589e\u503c\u7a0e\u53d1\u7968\u3002',
                MoreThanOneAppliedVAT: '\u8be5\u8d37\u9879\u901a\u77e5\u5355\u53ea\u80fd\u5bf9\u5e94\u4e00\u4e2a\u6b63\u6570\u589e\u503c\u7a0e\u53d1\u7968\u3002',
                NoVATInfo: '\u8be5\u53d1\u7968\u65e0\u5bf9\u5e94\u7684\u6b63\u5411\u589e\u503c\u7a0e\u53d1\u7968\u4fe1\u606f\u6216\u5907\u6ce8\u680f\u683c\u5f0f\u4e0d\u6b63\u786e\u3002',
                ExceedMaxItemAmount: '<b>\u4e0d\u80fd\u5408\u5e76</b>\u3002\u6240\u9009\u4e8b\u52a1\u5904\u7406\u8d85\u8fc78\u884c\u3002\u8bf7\u542f\u7528<b>\u9500\u8d27\u6e05\u5355</b>\u6216\u51cf\u5c11\u88ab\u5408\u5e76\u7684\u4e8b\u52a1\u5904\u7406\u3002',
                MergePosiNegaWithGroupItemDisabled: '<b>\u4e0d\u80fd\u5408\u5e76</b>\u3002\u6b63\u8d1f\u62b5\u6d88\u5408\u5e76\u65f6\uff0c\u5fc5\u987b\u542f\u7528<b>\u201c\u5408\u5e76\u76f8\u540c\u8d27\u54c1\u884c\u201d</b>\u3002',
                MergeSingleTranWithGroupItemDisabled: '<b>\u4e0d\u80fd\u5408\u5e76</b>\u3002\u5bf9\u5355\u4e2a\u4e8b\u52a1\u5904\u7406\u5408\u5e76\u65f6\uff0c\u5fc5\u987b\u542f\u7528<b>\u201c\u5408\u5e76\u76f8\u540c\u8d27\u54c1\u884c\u201d</b>\u3002',
                MergePosiNegaWithNegtiveItemAmount: '<b>\u4e0d\u80fd\u5408\u5e76</b>\u3002\u6b63\u8d1f\u62b5\u6d88\u5408\u5e76\u65f6\uff0c\u5404\u8d27\u54c1\u7684\u5408\u8ba1\u6570\u91cf\u3001\u5408\u8ba1\u91d1\u989d\u5fc5\u987b\u4e3a\u6b63\u6570\u6216\u96f6\u3002',
                CancelMessage: '\u6240\u6709\u672a\u4fdd\u5b58\u7684\u5408\u5e76\u5c06\u4e0d\u751f\u6548\uff0c\u786e\u5b9a\u53d6\u6d88\u4fdd\u5b58\uff1f<br>\u70b9\u51fb<b>\u201c\u53d6\u6d88\u201d</b>\u7ee7\u7eed\u7f16\u8f91\uff0c\u6216\u70b9\u51fb<b>\u201c\u786e\u5b9a\u201d</b>\u9000\u51fa\u7f16\u8f91\u3002',
                EditConsolidatedTran: '<b>\u4e0d\u80fd\u7f16\u8f91</b>\uff0c\u8be5\u4e8b\u52a1\u5904\u7406\u5df2\u7ecf\u5408\u5e76\u5f00\u7968\u3002\u5982\u9700\u7f16\u8f91\uff0c\u8bf7\u64a4\u9500\u5408\u5e76\u540e\u91cd\u8bd5\u3002',
                ErrorMessageEmpty: '\u9519\u8bef\u4fe1\u606f\u4e3a\u7a7a'    
            },
            en_US: {
                Error: 'Error',
                Warning: 'Warning',
                NoValidTranToMerge: 'No transactions available to merge.',
                NoSummaryTransToUnmerge: '<b>Unable to unmerge</b>. Select the consolidated primary rows and try again.',
                ConsolidatedSplitTranCannotMerge: '<b>Unable to merge</b>. There are consolidated or split transactions selected for merging. Remove the consolidated transactions from the selection and try again.',
                TotalAmountExceedMax: '<b>Unable to Merge</b>. The selected transactions are more than the <b>China MAX VAT Invoice Amount</b> limit (current limit: {$maxAmount}).',
                MergeDifferentCustomers: '<b>Unable to Merge</b>. Only transactions with same customer can be consolidated.',
                DifferentSheetNumber: '<b>Unable to Merge</b>. Merging <b>Credit Memos</b> or <b>Cash Refunds</b> must have the same <b>Information Sheet Number</b>.',
                DifferentVATCodeAndNumber: '<b>Unable to Merge</b>. Credit Memos or Cash Refunds to be merged must have the same <b>Remarks</b>. (<b>Invoice Code</b> and <b>Invoice Number</b>)',
                BlankSheetNumber: 'The invoice selected does not have VAT <b>Information Sheet Number</b> or has remarks that are in incorrect format.',
                NoAppliedVAT: 'Invalid Format. Please apply the Credit Memo or Cash Refund to the VAT Invoice first.',
                MoreThanOneAppliedVAT: 'This Credit Memo can only be applied to one VAT Invoice.',
                NoVATInfo: 'The invoice selected does not have VAT Information or has remarks that are in incorrect format.',
                ExceedMaxItemAmount: '<b>Unable to Merge</b>. The selected transactions are more than the 8-line limit after consolidation. Either enable <b>Sales List</b> or reduce your selected transactions to merge.',
                MergePosiNegaWithGroupItemDisabled: '<b>Unable to Merge</b>. Please enable <b>Group Same Items</b> when merging positive and negative transactions.',
                MergeSingleTranWithGroupItemDisabled: '<b>Unable to Merge</b>. Please enable <b>Group Same Items</b> when merging single transaction.',
                MergePosiNegaWithNegtiveItemAmount: '<b>Unable to Merge</b>. The resulting total of consolidating both negative and positive transactions is a negative value. Check your transactions and try again.',
                CancelMessage: '<b>You have unsaved changes</b>. Selected transactions will not be consolidated. Are you sure you want to cancel?<br>Click <b>Cancel</b> to continue editing or click <b>OK</b> to quit editing.',
                EditConsolidatedTran: '<b>Unable to Edit</b>. The selected transaction has been merged and cannot be changed. To edit, reset the merged transaction and try again.',
                ErrorMessageEmpty: 'Error Messages is empty.'    
            }
        },
        labels: {
            zh_CN: {
                itemnameforsales: '\u8be6\u89c1\u9500\u8d27\u6e05\u5355',
                Split: '\u5df2\u62c6\u5206',
                consolidated: '\u5df2\u5408\u5e76',
                groupsameitems: '\u5408\u5e76\u76f8\u540c\u8d27\u54c1\u884c'
            },
            en_US: {
                itemnameforsales: '\u8be6\u89c1\u9500\u8d27\u6e05\u5355',
                Split: 'Split',
                consolidated: 'Consolidated',
                groupsameitems: 'Group Same Items'
            }
        },
        status: {
            zh_CN: {
                exported: '\u5df2\u5bfc\u51fa',
                completed: '\u5df2\u5b8c\u6210',
                consolidated: '\u5df2\u5408\u5e76',
                split: '\u5df2\u62c6\u5206'
            },
            en_US: {
                exported: 'Exported',
                completed: 'Completed',
                consolidated: 'Consolidated',
                split: 'Split'
            }
        }
    };

    var names = {
        Errors: 'Errors',
        Labels: 'Labels',
        Status: 'Status'
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
