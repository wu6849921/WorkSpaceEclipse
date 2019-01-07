/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */

define([
    './app_cn_scripts_definition',
    '../../lib/wrapper/ns_wrapper_record'
], function(deployDefinition, record) {

    function activeScripts(params) {
        params.inactive = 'F';
        updateScriptDeployments(params);
        updateScript(params);
    }

    function inactiveScripts(params) {
        params.inactive = 'T';
        updateScriptDeployments(params);
        updateScript(params);
    }

    /*
     * For the suitelet deployment, if inactive this script but still deployed.
     * The link menu still exist. So need to undeploy it.
     */
    function updateScriptDeployments(params) {
        // filter all the undeployed deployments and set to be deployed
        var deployments = deployDefinition.queryDeployments({
            scriptids: params.scriptids
        });
        for (var j = 0; j < deployments.length; j++) {
            if (deployments[j].getValue('scripttype') === 'SCRIPTLET') {
                if (params.inactive === 'T' && deployments[j].getValue('isdeployed')) {
                    record.submitFields({
                        type: record.Type.SCRIPT_DEPLOYMENT,
                        id: deployments[j].getValue('internalid'),
                        values: {
                            isdeployed: 'F'
                        }
                    });
                } else if (params.inactive === 'F' && !deployments[j].getValue('isdeployed')) {
                    record.submitFields({
                        type: record.Type.SCRIPT_DEPLOYMENT,
                        id: deployments[j].getValue('internalid'),
                        values: {
                            isdeployed: 'T'
                        }
                    });
                }
            } else {
                if (!deployments[j].getValue('isdeployed')) {
                    record.submitFields({
                        type: record.Type.SCRIPT_DEPLOYMENT,
                        id: deployments[j].getValue('internalid'),
                        values: {
                            isdeployed: 'T'
                        }
                    });
                }
            }
        }
    }

    function updateScript(params) {
        var targetInactive = params.inactive;
        // filter the opposite status script
        params.inactive = params.inactive === 'T' ? 'F' : 'T';
        var scripts = deployDefinition.queryScripts(params);
        for (var j = 0; j < scripts.length; j++) {
            record.submitFields({
                type: 'script',
                id: scripts[j].getValue('internalid'),
                values: {
                    isinactive: targetInactive
                }
            });
        }
    }

    return {
        activeScripts: activeScripts,
        inactiveScripts: inactiveScripts
    };

});
