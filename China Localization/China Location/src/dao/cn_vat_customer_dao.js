/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../lib/wrapper/ns_wrapper_record',
    '../lib/wrapper/ns_wrapper_search',
    './helper/search_helper'
],

function(record, search, helper) {


    /**
     * @desc create filters for search customer
     * @param {Object} [subsidiary] - subsidiary ID
     * @return filter object
     */
	/**
	 * @desc filters by subsidiary.
	 * @param [subsidiary] - subsidiary.
	 * @return filters.
	 */
    function filters(subsidiary) {
        var filters = [
            helper.filter('isinactive').is('F')
        ];
        filters.push(helper.filter('subsidiary').anyof(subsidiary));
        return filters;
    }
    /**
	 * @desc create customer columns.
	 * @return column list.
	 */
    /**
     * @desc create columns for search customer
     * @return columns object
     */
    function columns() {
        var columns = [
            helper.column('entityid').create()
        ];
        columns.push(helper.column('isperson').create());
        columns.push(helper.column('firstname').create());
        columns.push(helper.column('middlename').create());
        columns.push(helper.column('lastname').create());
        columns.push(helper.column('companyname').create());
        columns.push(helper.column('internalid').create());
        columns.push(helper.column('custentity_cn_vat_taxpayer_types').create());
        return columns;
    }
    /**
	 * @desc fetch customers by subsidiary.
	 * @param [subsidiary] - subsidiary.
	 * @return customers.
	 */
    /**
     * @desc fetch customers if env is in OW
     * @param {Object} [subsidiary] - subsidiary ID
     * @return customer object
     */
    function fetchCustomers(subsidiary) {
        var customerSearch = search.create({
            type: 'CUSTOMER',
            filters: filters(subsidiary),
            columns: columns()
        });
        return customerSearch;
    }
    /**
	 * @desc fetch search customers item with type customer.
	 * @return search customer item.
	 */
    /**
     * @desc fetch customers if env is in SI
     * @return customer object
     */
    function fetchCustomersSI() {
        var customerSearch = search.create({
            type: 'CUSTOMER',
            columns: columns()
        });
        return customerSearch;
    }
    /**
	 * @desc create customer by tax payer.
	 * @param [subsidiary] - subsidiary.
	 * @return {object} - customer.
	 */
    /**
     * @desc create a customer object including taxpayer for customer, key is subsidiary.
     * @param {Object} [subsidiary] - subsidiary ID
     * @return JSON object
     */
    function createCustomerByTaxpayer(subsidiary) {
        var results = {};
        var general = [];
        var small = [];
        var fetchResults;
        if (subsidiary === -1) {
            fetchResults = fetchCustomersSI();
        } else {
            fetchResults = fetchCustomers(subsidiary);
        }

        fetchResults.run().each(function(result) {
            var taxpayerType = result.getValue('custentity_cn_vat_taxpayer_types');
            var isPerson = result.getValue('isperson'); 
            log.debug('taxpayerType', taxpayerType);
            if (taxpayerType.trim() === '1') {
                var generalCustomer = {};
                generalCustomer.id = result.getValue('internalid');
                if(isPerson)
                	generalCustomer.name = result.getValue('firstname')+result.getValue('middlename')+result.getValue('lastname');
                else
                	generalCustomer.name = result.getValue('companyname');
                general.push(generalCustomer);
            } else if (taxpayerType.trim() === '2') {
                var smallCustomer = {};
                smallCustomer.id = result.getValue('internalid');
                if(isPerson)
                	smallCustomer.name = result.getValue('firstname')+result.getValue('middlename')+result.getValue('lastname');
                else
                	smallCustomer.name = result.getValue('companyname');
                small.push(smallCustomer);
            }
            return true;
        });
        results.general = general;
        results.small = small;
        return results;
    }

    /**
     * @desc fetch all customers.
     * @param {Object} [subsidiary] - subsidiary ID
     * @return JSON object
     */
    function fetchAllCustomersBySub(subsidiary) {
        var customerBySub = {};
        if (subsidiary === -1) {
            var customerJson = createCustomerByTaxpayer(subsidiary);
            var key = subsidiary;
            customerBySub[key] = customerJson;
        } else {
            for ( var i in subsidiary) {
                log.debug('subsidiary[i].id: ', subsidiary[i].id);
                var customerJson = createCustomerByTaxpayer(subsidiary[i].id);
                var key = subsidiary[i].id;
                customerBySub[key] = customerJson;
            }
        }

        log.debug('results: ', JSON.stringify(customerBySub));

        return customerBySub;
    }

    /**
     * @desc fetch customer by customer id
     * @param {Object} [customerId] - customer ID
     * @return search result
     */
    function fetchCustomersById (customerId) {
        var customerSearch = search.create({
            type: 'CUSTOMER',
            filters: filterByCustId(customerId),
            columns: columns()
        });
        var rs = customerSearch.run().getRange({
            start: 0,
            end: 9
        }) || [];
        log.debug('fetchCustomersById results: ', JSON.stringify(rs));
        return rs;
    }
    /**
     * @desc create filter by customerId.
     * @param [customerId] - customer id.
     * @return {array} - filters.
     */
    /**
     * @desc create filter 
     * @param {Object} [customerId] - customer ID
     * @return filter object
     */
    function filterByCustId (customerId) {
        var filters = [
            helper.filter('isinactive').is('F')
        ];
        filters.push(helper.filter('internalid').anyof(customerId));
        return filters;
    }
    
    return {
        fetchAllCustomersBySub: fetchAllCustomersBySub,
        fetchCustomersById: fetchCustomersById
    };

});
