/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    '../../lib/wrapper/ns_wrapper_task',
    '../../lib/letssubmittask'
],

function(task, letssubmittask) {
	
	function createTask(param){
		var ssTask = task.create({
    		taskType:task.Type.SCHEDULED_SCRIPT,
    		scriptId:'customscript_ss_cn_voucher_print',
    		deploymentId:'customdeploy_ss_cn_voucher_print',
    		params: {custscript_search_filter: param}
    	});
		return ssTask;
	}
	
	function createAndSubmitTask(param){	
		var ssTask = createTask(param);
		letssubmittask.submitTask(ssTask);
	}

    return {
    	createTask:createTask,
    	createAndSubmitTask:createAndSubmitTask
    };
});
