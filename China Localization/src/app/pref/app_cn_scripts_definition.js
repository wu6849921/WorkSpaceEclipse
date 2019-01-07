/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */

define([
    '../../lib/wrapper/ns_wrapper_search',
    '../../lib/commons',
    '../../dao/helper/search_helper'
],

function(search, commons, helper) {

    function queryDeployments(params) {
        params.type = search.Type.SCRIPT_DEPLOYMENT;
        return query(params, filters, columns);
    }

    /*
     * @desc Search script or deployment record by script ids.
     * @params {Object} params - search conditions
     * scriptids: required
     * isdeployed: optional
     * filtersFunc: required
     */
    function query(params, filtersFunc, columnsFunc) {
        if (!commons.makesure(params.scriptids)) {
            return [];
        }
        var results = helper.resultset(search.create({
            type: params.type,
            filters: filtersFunc(params),
            columns: columnsFunc()
        }).run());
        log.debug('app_cn_scripts_definition.js: query', results);
        return results;
    }

    function columns() {
        return [
            helper.column('internalid').create(),
            helper.column('scripttype').create(),
            helper.column('isdeployed').create()
        ];
    }

    function columnsScript() {
        return [
            helper.column('internalid').create()
        ];
    }

    function filters(params) {
        var scriptIds = params.scriptids, theFilters = [];
        for (var i = 0; i < scriptIds.length; i++) {
            theFilters.push([
                'script.scriptid',
                search.Operator.IS,
                [
                    scriptIds[i]
                ]
            ]);
            theFilters.push('or');
        }
        if (commons.makesure(params.isdeployed)) {
            theFilters[theFilters.length - 1] = 'and';
            theFilters.push([
                'isdeployed',
                search.Operator.IS,
                params.isdeployed
            ]);
        } else {
            theFilters.splice(-1, 1);
        }
        log.debug('deployment filters', theFilters);
        return theFilters;
    }

    function scriptFilters(params) {
        var scriptIds = params.scriptids, theFilters = [];
        for (var i = 0; i < scriptIds.length; i++) {
            theFilters.push([
                'scriptid',
                search.Operator.IS,
                [
                    scriptIds[i]
                ]
            ]);
            theFilters.push('or');
        }
        if (commons.makesure(params.inactive)) {
            theFilters[theFilters.length - 1] = 'and';
            theFilters.push([
                'isinactive',
                search.Operator.IS,
                params.inactive
            ]);
        } else {
            theFilters.pop();
        }
        log.debug('script filters', theFilters);
        return theFilters;
    }

    function queryScripts(params) {
        params.type = 'script';
        return query(params, scriptFilters, columnsScript);
    }

    return {
        queryDeployments: queryDeployments,
        queryScripts: queryScripts
    };

});
