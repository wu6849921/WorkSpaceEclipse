/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../lib/wrapper/ns_wrapper_search',
    '../lib/wrapper/ns_wrapper_record',
    '../lib/wrapper/ns_wrapper_format',
    '../../lib/date-zh-CN',
    '../dao/helper/search_helper'
],

function(search, record, formatter, date, helper) {
    /**
     * @desc Cleanup income report data records of two days ago.
     */
    function cleanupReportData() {
        var twoDaysAgo = formatter.formatDate((2).days().ago());
        log.debug('cn_income_dao.js: cleanupReportData', 'Cleanup report data of ' + twoDaysAgo);

        var reportData = helper.resultset(search.create({
            type: 'customrecord_cn_income_report_data',
            filters: helper.filter('created').onorbefore(twoDaysAgo),
            columns: helper.column('internalid').create()
        }).run());

        var deleteCount = 0;
        for (var i = 0; i < reportData.length; i++) {
            var internalId = reportData[i].getValue('internalid');
            try {
                record.remove({
                    type: 'customrecord_cn_income_report_data',
                    id: internalId
                });
                deleteCount ++;
            } catch (ex) {
                log.error('cn_income_dao.js: cleanupReportData', 'Cannot delete income report data ' + internalId);
                log.error('cn_income_dao.js: cleanupReportData', ex.message);
            }
        }
        log.debug('cn_income_dao.js: cleanupReportData', 'Done. Total ' + deleteCount + ' report data deleted.');
    }

    return {
        cleanupReportData: cleanupReportData
    };

});
