/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */

define([ '../../pref/app_cn_pref_deploy_handler' ], function(deployHandler) {
	var cashflowScriptIds = [ 'customscript_ue_cn_cashflow',
			'customscript_ue_cn_cashflow_hide',
			'customscript_ue_cn_cashflow_subsidiary',
			'customscript_ue_cn_cashflow_validation',
			'customscript_cs_cn_cashflow_default',
			'customscript_cs_cn_cashflow_filter',
			'customscript_cs_cn_cashflow_validation',
			'customscript_sl_cn_cashflow',
			'customscript_sl_cn_cashflow_validation',
			'customscript_ss_cn_cashflow_collect',
			'customscript_ss_cn_cashflow_recon_clean',
			'customscript_rl_cn_run_cashflow_reports' ];

	var cashflowPrefScriptIds = [ 'customscript_ue_cn_cashflow_pref' ];

	function isMatchedFeature(feature) {
		return feature === 'custrecord_cn_pref_cfs';
	}

	function handle(value) {
		log.debug('app_cn_cashflow_pref_handler.js, handle',
				'handle deployments for cashflow');

		if (shouldEnableFeature(value)) {
			var scriptsToActive = cashflowScriptIds;
			var scriptsToInactive = cashflowPrefScriptIds;
		} else {
			scriptsToActive = cashflowPrefScriptIds;
			scriptsToInactive = cashflowScriptIds;
		}
		deployHandler.activeScripts({
			scriptids : scriptsToActive
		});
		deployHandler.inactiveScripts({
			scriptids : scriptsToInactive
		});
	}

	function shouldEnableFeature(value) {
		return value === 'T';
	}

	return {
		isMatchedFeature : isMatchedFeature,
		handle : handle
	};

});
