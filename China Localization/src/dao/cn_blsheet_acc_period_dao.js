/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../lib/wrapper/ns_wrapper_record',
    '../lib/wrapper/ns_wrapper_search',
    '../lib/commons',
    './helper/search_helper'
],

function(record, search, commons, helper) {


    /**
     * @desc fetchAllPeriod where 
     *      (isAdjust is not true) 
     *      and if calendarId is not null (fiscalcalendar = calendarId)
     * @param calendarId : number
     * if no calendarId , fetchAll
     * @return {array} - periods.
     */
    function fetchAllPeriodsforLOV(calendarId) {
        var params = {
            isadjust: false
        };
        if (commons.makecertain(calendarId))
            params.calendarId = calendarId;

        var rs = fetchPeriods(params);
        return rs;

    }
    /**
     * @desc fetch periods by parameters.
     * @param {object} [params] - parameter.
     * @return {array} - period list.
     */
    function fetchPeriods(params) {
        log.debug('period dao', 'fetchPeriods');
        // no params, return all
        var rs = query(params);
        return rs;

    }

    /**
     * @desc query periods by parameters.
     * @param {object} [params] - parameter.
     * @return {array} - period list.
     */
    function query(params) {
        return search.create({
            type: record.Type.ACCOUNTING_PERIOD,
            filters: filters(params),
            columns: columns(params)
        }).run().getRange({
            start: 0,
            end: 999
        }) || [];

    }
    /**
     * @desc create filters by parameters.
     * @param {object} [params] - parameter.
     * @return {array} - filters.
     */
    function filters(params) {

        var filters = [];
        // no params return all
        if (!commons.makecertain(params))
            return filters;

        if (params.isadjust === false) {

            filters.push(helper.filter('isadjust').is('F'));
        }
        if (commons.makecertain(params.calendarId)) {
            filters.push(helper.filter('fiscalcalendar').is(params.calendarId));
        }
        return filters;

    }
    /**
     * @desc create columns by parameters.
     * @param {object} [params] - parameter.
     * @return {array} - column list.
     */
    function columns(params) {

        var columnList = [
            helper.column('startdate').sort(search.Sort.ASC).create(),
            helper.column('enddate').sort(search.Sort.DESC).create(),
            helper.column('isyear').sort(search.Sort.DESC).create(),
            helper.column('isquarter').sort(search.Sort.DESC).create(),
            // helper.column('isadjust').sort(search.Sort.ASC).create(),
            helper.column('periodname').create()

        ];


        if (commons.makecertain(params) && commons.makecertain(params.calendarId)) {
            columnList = columnList.concat([
                helper.column('fiscalcalendar').create()
            ]);
        }
        return columnList;
    }



    return {
        fetchAllPeriodsforLOV: fetchAllPeriodsforLOV,
        fetchPeriods: fetchPeriods
    };

});
