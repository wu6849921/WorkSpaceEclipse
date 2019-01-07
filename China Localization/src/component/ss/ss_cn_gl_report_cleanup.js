/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope TargetAccount
 */
define(['../../dao/cn_extended_report_dao'],

function(extendedReportDao) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
        extendedReportDao.cleanupReportData('customrecord_cn_gl_report_data');
    }

    return {
        execute: execute
    };
    
});
