/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/wrapper/ns_wrapper_search',
    '../../lib/wrapper/ns_wrapper_record',
    '../../dao/helper/search_helper',
    '../../lib/commons'
],

function(search, record, helper, commons) {
    /**
     * @desc fetch all subsidiaries with parameters.
     * @param {object} [params] - subsidiary parameters.
     * @return {array} - subsidiary list.
     */
    function fetchAllSubsidiaries(params) {
        var result = [];
        var subArray = search.create({
            type: search.Type.SUBSIDIARY,
            columns: columns(params),
            filters: filters(params)
        }).run().getRange({
            start: 0,
            end: 1000
        }) || [];
        for ( var subIdx in subArray) {
            try {
                record.load({
                    type: record.Type.SUBSIDIARY,
                    id: subArray[subIdx].id
                });
                result.push(subArray[subIdx]);
            } catch (ex) {
                continue;
            }
        }
        return result;
    }
    /**
     * @desc create filters by parameters.
     * @param {object} [params] - parameters which used to filter.
     * @return {array} - filters
     */
    function filters(params) {
        var filters = [
            helper.filter('isinactive').is('F')
        ];
        if (!commons.makesure(params)) {
            return filters;
        }
        if (commons.isPrimitive(params)) {
            filters.push(helper.filter('internalid').is(params));
        } else if (commons.makesure(params.id)) {
            filters.push(helper.filter('internalid').is(params.id));
        }
        return filters;
    }
    /**
     * @desc create columns by parameters.
     * @param {object} [params] - parameters which used check if calendar enable or not.
     * @return {array} columns contain:name,namenohierarchy,fiscalcalendar.
     */
    function columns(params) {
        var columns = [
            helper.column('name').create(),
            helper.column('namenohierarchy').create()
        ];
        if (!commons.makesure(params)) {
            return columns;
        }
        if (params.calendarEnable) {
            columns.push(helper.column('fiscalcalendar').create());
        }
        return columns;
    }



    return {
        fetchAllSubsidiaries: fetchAllSubsidiaries

    };

});
