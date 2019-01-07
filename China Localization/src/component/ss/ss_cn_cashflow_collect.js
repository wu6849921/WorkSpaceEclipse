/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NScriptType ScheduledScript
 * @NScriptName CN SS Cash Flow Collect
 * @NScriptId _ss_cn_cashflow_collect
 * @NModuleScope Public
 */
define([
    '../../dao/cn_cashflow_collector_dao',
    '../../app/cashflow/app_cn_cashflow_je_collector',
    '../../app/cashflow/app_cn_cashflow_ar_collector',
    '../../app/cashflow/app_cn_cashflow_ap_collector',
    '../../app/cashflow/app_cn_cashflow_pymt_ap_cacher',
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../lib/commons'
],

function(collectorDao, journalCollector, arCollector, apCollector, pymtCacher, runtime, commons) {
    var collectors = [
        apCollector,
        arCollector,
        journalCollector
    ];

    function execute(context) {
        var startTime = runtime.clock();

        var params = runtime.getCurrentScript().getParameter('custscript_cashflow_params');
        var paramsObj = JSON.parse(params);
        var type = paramsObj.type;
        var trantype = paramsObj.trantype;
        var tranid = paramsObj.tranid;
        var paymentApplyInfo = paramsObj.apply;
        if (commons.makesure(paramsObj.usecache)) {
            var recordarray = pymtCacher.getCacheRecord(paramsObj.apply);
            paymentApplyInfo = recordarray;
            pymtCacher.deleteCacheRecord(paramsObj.apply);
        }


        log.debug('ss_cn_cashflow_collect params', 'type=' + type + ', trantype=' + trantype + ', tranid=' + tranid);

        collectorDao.delCashedTransaction(tranid);

        if (type === 'delete') {
            // If trigger type is delete, no need to call individual collector
            return;
        }
        for ( var i in collectors) {
            if (collectors[i].matches(trantype)) {
                var result = collectors[i].collect(tranid, paymentApplyInfo, trantype);
                break;
            }
        }
        if (commons.makecertain(result) && commons.isArray(result) && result.length > 0) {
            collectorDao.insertCashFlowReconciliation(result);
        }

        var endTime = runtime.clock();
        log.audit('ss_cn_cashflow_collect.execute', 'wholeTime=' + (endTime - startTime));
    }

    return {
        execute: execute
    };

});
