/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope TargetAccount
 */
define(['../../dao/cn_income_dao'],

function(incomeDao) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
        incomeDao.cleanupReportData();
    }

    return {
        execute: execute
    };
    
});
