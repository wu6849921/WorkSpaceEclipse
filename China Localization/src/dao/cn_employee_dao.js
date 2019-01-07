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

    function fetchEmployees(params) {
        // no params, return all
        var rs = query({
            access: 'T'
        });
        if (commons.makesure(rs)) {
            return rs;
        }
    }

    function query(params) {
        return search.create({
            type: search.Type.EMPLOYEE,
            filters: filters(params),
            columns: columns(params)
        }).run().getRange({
            start: 0,
            end: 1000
        }) || [];

    }

    function filters(params) {

        var filters = [
            helper.filter('isinactive').is('F')
        ];
        //no params return all       
        if (!commons.makecertain(params)) {
            return filters;
        }

        if (commons.makecertain(params.access)) {
            filters.push(helper.filter('giveaccess').is('T'));
        }
        return filters;

    }

    function columns(params) {

        var column = [
            helper.column('firstname').create(),
            helper.column('lastname').create()
        ];

        return column;
    }

    function fetchAllEmployeesAsDropdown() {
        var results = fetchEmployees();
        var options = [];
        for ( var i in results) {
            options[i] = {
                value: results[i].id,
                text: results[i].getValue('firstname') + ' ' + results[i].getValue('lastname')
            };
        }
        return options;
    }
    return {
        fetchEmployees: fetchEmployees,
        fetchAllEmployeesAsDropdown: fetchAllEmployeesAsDropdown
    };

});
