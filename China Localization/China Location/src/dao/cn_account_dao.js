/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    '../lib/wrapper/ns_wrapper_search',
    '../lib/commons',
    './helper/search_helper',
],

function(search, commons, helper) {
	/**
	 * @desc fetch accounts by parameters.
	 * @param {object} [params]- parameters.
	 * @return all accounts whose type is bank.
	 */
    function fetchAccounts(params) {
        // no params, return all
        var rs = query({
            type: 'Bank'
        });
        if (commons.makesure(rs)) {
            return rs;
        }

    }
	/**
	 * @desc query account by parameters.
	 * @param {object} [params]- parameters.
	 * @return {array} - account list.
	 */
    function query(params) {
        return search.create({
            type: search.Type.ACCOUNT,
            filters: filters(params),
            columns: columns(params)
        }).run().getRange({
            start: 0,
            end: 1000
        }) || [];

    }
	/**
	 * @desc filter account by parameters.
	 * @param {object} [params]- parameters.
	 * @return {array} - account list.
	 */
    function filters(params) {

        var filters = [

        ];
        //no params return all       
        if (!commons.makecertain(params)) {
            return filters;
        }

        if (commons.makecertain(params.type)) {
            filters.push({
                name: 'type',
                operator: search.Operator.ANYOF,
                values: params.type
            });
        }
        return filters;

    }
	/**
	 * @desc create columns by parameters.
	 * @param {object} [params]- parameters.
	 * @return {array} - column list.
	 */
    function columns(params) {

        var column = [
            helper.column('name').create(),
            helper.column('type').create()
        ];

        return column;
    }

    return {
        fetchAccounts: fetchAccounts
    };

});
