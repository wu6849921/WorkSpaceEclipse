/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NScriptType BundleInstallationScript
 * @NModuleScope Public
 */
define([
    'N/cache',
    'N/search',
    'N/record'
],

function(cache, search, record) {
    
    /*
     * @desc A variable to store pref bundle cache name.
     * @var {string} prefCache
     */
    var prefCache = 'PREF_BUNDLE_CACHE';

    /*
     * @desc A variable to store key in cache.
     * @var {string} prefKey
     */
    var prefKey = 'deploymentsBeforeUpdate';

    /*
     * @desc Definition for cache
     * @var {Object} names
     */
    var names = {
        Voucher: 'VOUCHER_CACHE',
        CashFlow: 'CASHFLOW_CACHE',
        Income: 'INCOME_CACHE',
        Atbl: 'ATBL_CACHE',
        Sblg: 'SBLG_CACHE',
        Cbjl: 'CBJL_CACHE',
        Pref: 'PREF_CACHE',
        Common: 'COMMON_CACHE',
        VAT: 'vat',
        BLSheet: 'blsheet_labels',
        Pref_Bundle: prefCache
    };

    var keys = [
        'Labels',
        'File',
        'Currencies',
        'Operators',
        'Errors',
        'Email',
        'vat_labels',
        'blsheet_labels',
        prefKey
    ];

    /*
     * @desc A variable to store features controlled by preference.
     * @var {Array} list of feature names
     */
    var features = [
        'custrecord_cn_pref_vat',
        'custrecord_cn_pref_cfs'
    ];

    /*
     * @desc A variable to store script ids for vat
     * @var {Object} - vatScriptIds
     */
    var vatScriptIds = {
        feature_scripts: [
            'customscript_ue_cn_vat_subsidiary',
            'customscript_ue_cn_vat_trans',
            'customscript_sl_cn_vat',
            'customscript_cs_cn_vat_trans_validation',
            'customscript_sl_cn_vat_preview_drilldown',
            'customscript_sl_cn_vat_import',
            'customscript_sl_cn_vat_edit'
        ],
        pref_scripts: [
            'customscript_ue_cn_pref_vat'
        ]
    };

    /*
     * @desc A variable to store cashflow statement related script ids.
     */
    var cashflowScriptIds = {
        feature_scripts: [
            'customscript_ue_cn_cashflow',
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
            'customscript_rl_cn_run_cashflow_reports'
        ],
        pref_scripts: [
            'customscript_ue_cn_cashflow_pref'
        ]
    };

    /*
     * @desc A variable to store lines of script ids by feature.
     * @var {Object} scriptIdsByFeature
     */
    var scriptIdsByFeature = {
        'custrecord_cn_pref_vat': vatScriptIds,
        'custrecord_cn_pref_cfs': cashflowScriptIds
    };

    /**
     * Executes after a bundle in a target account is updated.
     *
     * @param {Object} params
     * @param {number} params.version - Version of the bundle being installed
     *
     * @since 2016.1
     */
    function afterInstall(params) {
        var deploymentsAfterInstall = parseSearchResult(queryDeployments(getAllPrefScriptIds()));
        deploymentsAfterInstall.prefscriptids = deploymentsAfterInstall.scriptids;
        // all pref scripts should be inactive
        handleNewScripts(true, deploymentsAfterInstall.scriptids, deploymentsAfterInstall);
    }

    /**
     * Executes before a bundle is installed for the first time in a target account.
     *
     * @param {Object} params
     * @param {number} params.fromVersion - Version currently installed
     * @param {number} params.toVersion -  New version of the bundle being installed
     *
     * @since 2016.1
     */
    function beforeUpdate(params) {
        getCache(prefCache).put({
            key: prefKey,
            value: queryDeploymentsByFeature(),
            ttl: 300
        });
    }

    /**
     * Executes after a bundle in a target account is updated.
     *
     * @param {Object} params
     * @param {number} params.fromVersion - Version currently installed
     * @param {number} params.toVersion -  New version of the bundle being installed
     *
     * @since 2016.1
     */
    function afterUpdate(params) {
        toggleDeployments();
        refreshCache();
    }

    function toggleDeployments() {
        var deploymentsAfterUpdate = queryDeploymentsByFeature();
        var deploymentsBeforeUpdate = JSON.parse(getCache(prefCache).get({
            key: prefKey
        }));
        var preferences = queryPreference();

        for ( var feature in deploymentsAfterUpdate) { // handle by feature
            var currentDeploymentObj = deploymentsAfterUpdate[feature];
            var preDeploymentObj = deploymentsBeforeUpdate[feature];
            var existedScriptIds = compare(currentDeploymentObj.scriptids, preDeploymentObj.scriptids, false);
            var existedDeployIds = compare(currentDeploymentObj.deployids, preDeploymentObj.deployids, false);
            var newScriptIds = compare(currentDeploymentObj.scriptids, preDeploymentObj.scriptids, true);
            var newDeployIds = compare(currentDeploymentObj.deployids, preDeploymentObj.deployids, true);

            handleExistedScripts(existedScriptIds, preDeploymentObj, currentDeploymentObj);
            handleExistedDeployments(existedDeployIds, preDeploymentObj, currentDeploymentObj);
            handleNewScripts(preferences[feature], newScriptIds, currentDeploymentObj);
            handleNewDeployments(preferences[feature], newDeployIds, currentDeploymentObj);
        }
    }

    function compare(idArray, otherIdArray, isDiff) {
        return idArray.filter(function(id) {
            if (isDiff) { // get different ones
                return otherIdArray.indexOf(id) === -1;
            } else { // get existed ones
                return otherIdArray.indexOf(id) >= 0;
            }
        });
    }

    function handleExistedScripts(existedScriptIds, preDeploymentObj, currentDeploymentObj) {
        var preIdRecords = preDeploymentObj.scriptidrecords;
        var currentIdRecords = currentDeploymentObj.scriptidrecords;

        for (var i = 0; i < existedScriptIds.length; i++) {
            var scriptId = existedScriptIds[i];
            var isInactive = currentIdRecords[scriptId].isinactive;
            var preIsInactive = preIdRecords[scriptId].isinactive;

            if (isInactive !== preIsInactive) { // restore isinactive value
                record.submitFields({
                    type: 'script',
                    id: currentIdRecords[scriptId].internalid,
                    values: {
                        isinactive: preIsInactive
                    }
                });
            }
        }
    }

    /*
     * @desc isdeployed not match, should restore isdeploy value
     * @param {Array} existedDeployIds - existed deployment ids.
     * @param {Object} preDeploymentObj - {deployids:[], prefdeployids:[], deployidrecords:{}}
     * @param {Object} currentDeploymentObj - {deployids:[], prefdeployids:[], deployidrecords:{}}
     */
    function handleExistedDeployments(existedDeployIds, preDeploymentObj, currentDeploymentObj) {
        var preIdRecords = preDeploymentObj.deployidrecords;
        var currentIdRecords = currentDeploymentObj.deployidrecords;

        for (var i = 0; i < existedDeployIds.length; i++) {
            var deployId = existedDeployIds[i];
            var isDeployed = currentIdRecords[deployId].isdeployed;
            var preIsDeployed = preIdRecords[deployId].isdeployed;

            if (isDeployed !== preIsDeployed) { // restore isdeployed value
                record.submitFields({
                    type: record.Type.SCRIPT_DEPLOYMENT,
                    id: currentIdRecords[deployId].internalid,
                    values: {
                        isdeployed: preIsDeployed
                    }
                });
            }
        }
    }

    /*
     * @desc Script does not exist in the ones before bundle update should be a new one.
     * 1. feature enable: disable preference scripts
     * 2. feature disable: disable feature scripts
     * @params {Boolean} - indicate feature enable/disable
     * @params {Array} - newly added script ids
     * @params {Object} - {scriptids:[], prefscriptids:[], scriptidrecords:{}}
     */
    function handleNewScripts(isFeatureEnabled, newScriptIds, currentDeploymentObj) {
        var prefScriptIds = currentDeploymentObj.prefscriptids;
        var idRecords = currentDeploymentObj.scriptidrecords;

        for (var i = 0; i < newScriptIds.length; i++) {
            var isPrefScript = prefScriptIds.indexOf(newScriptIds[i]) >= 0;

            if ((!isFeatureEnabled && !isPrefScript) || (isFeatureEnabled && isPrefScript)) {
                record.submitFields({
                    type: 'script',
                    id: idRecords[newScriptIds[i]].internalid,
                    values: {
                        isinactive: 'T'
                    }
                });
            }
        }
    }

    /*
     * @desc Handle new deployments
     * 1. for suitelet deployment, undeploy the deployment if feature is disabled
     * 2. for other deployments, no action
     */
    function handleNewDeployments(isFeatureEnabled, newDeployIds, currentDeploymentObj) {
        var idRecords = currentDeploymentObj.deployidrecords;

        for (var i = 0; i < newDeployIds.length; i++) {
            var deployId = newDeployIds[i];
            if (!isFeatureEnabled && isSuitelet(idRecords[deployId].scripttype)) {
                record.submitFields({
                    type: record.Type.SCRIPT_DEPLOYMENT,
                    id: idRecords[deployId].internalid,
                    values: {
                        isdeployed: 'F'
                    }
                });
            }
        }
    }

    function queryPreference() {
        var columns = [], preferences = {};
        for (var i = 0; i < features.length; i++) {
            columns.push(search.createColumn({
                name: features[i]
            }));
            preferences[features[i]] = true;
        }
        var result = search.create({
            type: "customrecord_cn_preferences",
            columns: columns
        }).run().getRange({
            start: 0,
            end: 1
        }) || [];

        if (result.length > 0) {
            for (var i = 0; i < features.length; i++) {
                preferences[features[i]] = isFeatureEnabled(result[0].getValue(features[i]));
            }
        }
        log.debug('bi_cn_cache_cleanup.js: queryPreference', JSON.stringify(preferences));
        return preferences;
    }

    function isFeatureEnabled(value) {
        return !value || value === 'T';
    }

    function isSuitelet(scriptType) {
        return scriptType === 'SCRIPTLET';
    }

    function refreshCache() {
        for ( var name in names) {
            var theCache = getCache(names[name]);
            if (!theCache) {
                continue;
            }
            for (var i = 0; i < keys.length - 1; i++) {
                theCache.remove({
                    key: targetENKey(keys[i])
                });
                theCache.remove({
                    key: targetCNKey(keys[i])
                });
            }
            theCache.remove({
                key: keys[keys.length - 1]
            });
        }
    }

    function targetENKey(name) {
        return name + '_en_US';
    }

    function targetCNKey(name) {
        return name + '_zh_CN';
    }

    function getAllPrefScriptIds() {
        var prefScriptIds = [];
        for (var feature in scriptIdsByFeature) {
            prefScriptIds = prefScriptIds.concat(scriptIdsByFeature[feature].pref_scripts);
        }
        return prefScriptIds;
    }

    function queryDeploymentsByFeature() {
        var deployments = {};
        for (var feature in scriptIdsByFeature) {
            var featureDeployments = queryDeployments(scriptIdsByFeature[feature].feature_scripts);
            var prefDeployments = queryDeployments(scriptIdsByFeature[feature].pref_scripts);
            var mergedDeployments = parseSearchResult(featureDeployments.concat(prefDeployments));
            deployments[feature] = {
                deployids: mergedDeployments.deployids,
                deployidrecords: mergedDeployments.deployidrecords,
                scriptids: mergedDeployments.scriptids,
                scriptidrecords: mergedDeployments.scriptidrecords,
                prefscriptids: parseSearchResult(prefDeployments).scriptids
            };
        }
        return deployments;
    }

    function parseSearchResult(deployments) {
        var deployIdRecords = {}, deployIds = [];
        var scriptIdRecords = {}, scriptIds = [];
        for (var i = 0; i < deployments.length; i++) {
            var deployment = parseRecord(deployments[i]);
            deployIds.push(deployment.deployid);
            deployIdRecords[deployment.deployid] = {
                internalid: deployment.deployinternalid,
                isdeployed: deployment.isdeployed,
                scripttype: deployment.scripttype
            };
            if (scriptIds.indexOf(deployment.scriptid) < 0) {
                scriptIds.push(deployment.scriptid);
                scriptIdRecords[deployment.scriptid] = {
                    internalid: deployment.scriptinternalid,
                    isinactive: deployment.isinactive
                };
            }
        }
        return {
            deployids: deployIds,
            deployidrecords: deployIdRecords,
            scriptids: scriptIds,
            scriptidrecords: scriptIdRecords
        };
    }

    function parseRecord(deployment) {
        return {
            deployid: deployment.getValue('scriptid'),
            deployinternalid: deployment.getValue('internalid'),
            isdeployed: deployment.getValue('isdeployed'),
            scriptid: deployment.getValue({
                name: 'scriptid',
                join: 'script'
            }),
            scriptinternalid: deployment.getValue({
                name: 'internalid',
                join: 'script'
            }),
            isinactive: deployment.getValue({
                name: 'isinactive',
                join: 'script'
            }),
            scripttype: deployment.getValue({
                name: 'scripttype',
                join: 'script'
            })
        };
    }

    function queryDeployments(scriptIds) {
        return search.create({
            type: search.Type.SCRIPT_DEPLOYMENT,
            filters: filters(scriptIds),
            columns: columns()
        }).run().getRange({
            start: 0,
            end: 1000
        }) || [];
    }

    function filters(scriptIds) {
        if (!scriptIds) {
            return;
        }
        var theFilters = [];
        for (var i = 0; i < scriptIds.length; i++) {
            theFilters.push([
                'script.scriptid',
                search.Operator.IS,
                [ scriptIds[i] ]
            ]);
            theFilters.push('or');
        }
        theFilters.splice(-1, 1);
        return theFilters;
    }

    function columns() {
        return [
            search.createColumn({
                name: 'internalid'
            }),
            search.createColumn({
                name: 'scriptid'
            }),
            search.createColumn({
                name: 'isdeployed'
            }),
            search.createColumn({
                name: 'internalid',
                join: 'script'
            }),
            search.createColumn({
                name: 'scriptid',
                join: 'script'
            }),
            search.createColumn({
                name: 'isinactive',
                join: 'script'
            }),
            search.createColumn({
                name: 'scripttype',
                join: 'script'
            })
        ];
    }

    function getCache(name) {
        return cache.getCache({
            name: name,
            scope: cache.Scope.PROTECTED
        });
    }

    return {
        afterInstall: afterInstall,
        beforeUpdate: beforeUpdate,
        afterUpdate: afterUpdate
    };

});
