/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */

define([
    '../../pref/app_cn_pref_deploy_handler'
], function(deployHandler) {

    var vatScriptIds = [
        'customscript_ue_cn_vat_subsidiary',
        'customscript_ue_cn_vat_trans',
        'customscript_sl_cn_vat',
        'customscript_cs_cn_vat_trans_validation',
        'customscript_sl_cn_vat_preview_drilldown',
        'customscript_sl_cn_vat_import',
        'customscript_sl_cn_vat_edit'
    ];

    var vatPrefScriptIds = [
        'customscript_ue_cn_pref_vat'
    ];

    function isMatchedFeature(feature) {
        return feature === 'custrecord_cn_pref_vat';
    }

    function handle(value) {
        log.debug('app_cn_vat_pref_handler.js, handle', 'handle deployments for vat');

        if (shouldEnableFeature(value)) {
            var scriptsToActive = vatScriptIds;
            var scriptsToInactive = vatPrefScriptIds;
        } else {
            scriptsToActive = vatPrefScriptIds;
            scriptsToInactive = vatScriptIds;
        }
        deployHandler.activeScripts({
            scriptids: scriptsToActive
        });
        deployHandler.inactiveScripts({
            scriptids: scriptsToInactive
        });
    }

    function shouldEnableFeature(value) {
        return value === 'T';
    }

    return {
        isMatchedFeature: isMatchedFeature,
        handle: handle
    };

});
